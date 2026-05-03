/**
 * Email subscribe adapter for VIDDA WEAR.
 *
 * Active provider is selected by env at runtime, in priority order:
 *   1. KLAVIYO_API_KEY   + KLAVIYO_LIST_ID  → Klaviyo
 *   2. MAILCHIMP_API_KEY + MAILCHIMP_LIST_ID + MAILCHIMP_DC → Mailchimp
 *   3. (none)                                                → "log" mode
 *
 * In log mode the function records the subscriber to stdout and returns
 * success — useful for local dev and preview deploys without keys.
 *
 * Once any provider's keys land in Vercel/CI env, the adapter switches over
 * automatically. No code change required.
 */

export interface SubscribeInput {
  email: string;
  /** Optional source tag, e.g. "summer-26-lp", "footer", "popup" */
  source?: string;
  /** Optional locale, e.g. "ar-EG" / "en-US" */
  locale?: string;
}

export type SubscribeResult =
  | { ok: true; provider: "klaviyo" | "mailchimp" | "log" }
  | { ok: false; error: string; provider: "klaviyo" | "mailchimp" | "log" };

/* ---------- providers ---------- */

async function viaKlaviyo(input: SubscribeInput): Promise<SubscribeResult> {
  const key = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (!key || !listId) return { ok: false, error: "Klaviyo not configured", provider: "klaviyo" };
  try {
    const res = await fetch(`https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/`, {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        revision: "2024-10-15",
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: { data: [{ type: "profile", attributes: { email: input.email } }] },
            custom_source: input.source ?? "vidda-web",
          },
          relationships: { list: { data: { type: "list", id: listId } } },
        },
      }),
    });
    if (!res.ok) return { ok: false, error: `Klaviyo ${res.status}: ${await res.text()}`, provider: "klaviyo" };
    return { ok: true, provider: "klaviyo" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), provider: "klaviyo" };
  }
}

async function viaMailchimp(input: SubscribeInput): Promise<SubscribeResult> {
  const key = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dc = process.env.MAILCHIMP_DC; // e.g. "us20"
  if (!key || !listId || !dc) return { ok: false, error: "Mailchimp not configured", provider: "mailchimp" };
  try {
    const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: input.email,
        status: "subscribed",
        tags: input.source ? [input.source] : [],
        language: input.locale ?? "ar",
      }),
    });
    if (!res.ok) return { ok: false, error: `Mailchimp ${res.status}: ${await res.text()}`, provider: "mailchimp" };
    return { ok: true, provider: "mailchimp" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), provider: "mailchimp" };
  }
}

function viaLog(input: SubscribeInput): SubscribeResult {
  // Log mode for local/preview without provider keys. The line is intentionally
  // greppable so we can scan logs to recover early signups before keys land.
  console.log(`[subscribe] email=${input.email} source=${input.source ?? "-"} locale=${input.locale ?? "-"}`);
  return { ok: true, provider: "log" };
}

/* ---------- entrypoint ---------- */

export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { ok: false, error: "Invalid email", provider: "log" };
  }
  if (process.env.KLAVIYO_API_KEY && process.env.KLAVIYO_LIST_ID) return viaKlaviyo(input);
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID && process.env.MAILCHIMP_DC) return viaMailchimp(input);
  return viaLog(input);
}
