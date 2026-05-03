"use client";

import { useRouter } from "next/navigation";

const FLOW = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = typeof FLOW[number];

export function OrderStatusActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const set = async (next: Status) => {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  };
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {FLOW.filter((s) => s !== status).map((s) => (
        <button key={s} onClick={() => set(s)} className="btn-pill btn-pill-outline !px-3 !py-1 text-xs uppercase tracking-eyebrow">
          → {s}
        </button>
      ))}
    </div>
  );
}
