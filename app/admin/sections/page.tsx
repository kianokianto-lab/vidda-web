"use client";

import { useEffect, useState } from "react";
import type { DbHomepageSection } from "@/lib/repos";

const KIND_OPTIONS: DbHomepageSection["kind"][] = ["hero", "band", "feature", "promo"];

export default function AdminSectionsPage() {
  const [list, setList] = useState<DbHomepageSection[]>([]);
  const [editing, setEditing] = useState<DbHomepageSection | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const r = await fetch("/api/admin/sections");
    const d = await r.json();
    if (d.ok) setList(d.sections);
  };
  useEffect(() => { load(); }, []);

  const save = async (form: Partial<DbHomepageSection>, id?: string) => {
    const url = id ? `/api/admin/sections/${id}` : "/api/admin/sections";
    const method = id ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    await load();
    setEditing(null); setCreating(false);
  };
  const remove = async (id: string) => {
    if (!confirm("Delete section?")) return;
    await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    await load();
  };
  const move = async (id: string, dir: 1 | -1) => {
    const idx = list.findIndex((s) => s.id === id);
    const swap = list[idx + dir];
    if (!swap) return;
    await save({ sort: swap.sort }, id);
    await save({ sort: list[idx].sort }, swap.id);
  };

  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">Homepage sections</h1>
          <p className="mt-2 text-sm opacity-70">Manage hero, bands, features. Order, enable, edit copy.</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-pill btn-pill-primary">+ New section</button>
      </header>

      {(creating || editing) && (
        <SectionForm
          initial={editing}
          onSave={(form) => save(form, editing?.id)}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      )}

      <div className="mt-8 space-y-3">
        {list.length === 0 ? (
          <p className="rounded-sm border border-ink/10 bg-white p-6 text-sm opacity-60">No DB-driven sections. Homepage uses static layout from <code>app/page.tsx</code> until you add some here.</p>
        ) : list.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 rounded-sm border border-ink/10 bg-white p-4">
            <span className="rounded-full bg-burgundy/10 px-3 py-1 text-xs font-bold uppercase tracking-eyebrow text-burgundy">{s.kind}</span>
            <div className="flex-1">
              <p className="font-bold">{s.title || <em className="opacity-50">(no title)</em>}</p>
              {s.body && <p className="text-xs opacity-60 line-clamp-1">{s.body}</p>}
            </div>
            <span className={`text-xs ${s.enabled ? "text-emerald-700" : "opacity-40"}`}>{s.enabled ? "Enabled" : "Disabled"}</span>
            <div className="flex gap-1">
              <button onClick={() => move(s.id, -1)} disabled={i === 0} className="px-2 text-xs disabled:opacity-30">↑</button>
              <button onClick={() => move(s.id, 1)} disabled={i === list.length - 1} className="px-2 text-xs disabled:opacity-30">↓</button>
            </div>
            <button onClick={() => setEditing(s)} className="text-xs underline">Edit</button>
            <button onClick={() => remove(s.id)} className="text-xs text-burgundy underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionForm({
  initial, onSave, onCancel,
}: { initial: DbHomepageSection | null; onSave: (form: Partial<DbHomepageSection>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    kind: initial?.kind ?? "band",
    title: initial?.title ?? "",
    body: initial?.body ?? "",
    cta_label: initial?.cta_label ?? "",
    cta_href: initial?.cta_href ?? "",
    image: initial?.image ?? "",
    sort: initial?.sort ?? 0,
    enabled: initial?.enabled ?? true,
  });
  return (
    <div className="mt-6 rounded-sm border border-burgundy/30 bg-white p-6">
      <h2 className="text-lg font-extrabold">{initial ? "Edit section" : "New section"}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-eyebrow opacity-70">Kind</span>
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as DbHomepageSection["kind"] })} className="w-full rounded-sm border border-ink/20 px-4 py-3">
            {KIND_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <I label="Sort" type="number" v={String(form.sort)} on={(v) => setForm({ ...form, sort: Number(v) })} />
        <I label="Title" v={form.title} on={(v) => setForm({ ...form, title: v })} wide />
        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-eyebrow opacity-70">Body</span>
          <textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full rounded-sm border border-ink/20 px-4 py-3 text-base" />
        </label>
        <I label="CTA label" v={form.cta_label} on={(v) => setForm({ ...form, cta_label: v })} />
        <I label="CTA href" v={form.cta_href} on={(v) => setForm({ ...form, cta_href: v })} mono />
        <I label="Image URL" v={form.image} on={(v) => setForm({ ...form, image: v })} wide mono />
        <label className="col-span-2 mt-1 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Enabled</label>
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={() => onSave(form)} className="btn-pill btn-pill-primary">Save</button>
        <button onClick={onCancel} className="btn-pill btn-pill-outline">Cancel</button>
      </div>
    </div>
  );
}

function I({ label, v, on, type = "text", mono, wide }: { label: string; v: string; on: (s: string) => void; type?: string; mono?: boolean; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-eyebrow opacity-70">{label}</span>
      <input type={type} value={v} onChange={(e) => on(e.target.value)} className={`w-full rounded-sm border border-ink/20 px-4 py-3 ${mono ? "font-mono text-sm" : "text-base"} focus:border-burgundy focus:outline-none`} />
    </label>
  );
}
