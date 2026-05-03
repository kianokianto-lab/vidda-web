"use client";

import { useEffect, useState } from "react";

const SLOTS: { key: "days" | "hours" | "minutes" | "seconds"; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Sec" },
];

function diff(targetMs: number) {
  const now = Date.now();
  const ms = Math.max(0, targetMs - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: ms === 0 };
}

export function Summer26Countdown({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso).getTime();
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false });

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t.done) {
    return (
      <p className="inline-block rounded-full bg-burgundy px-6 py-2 text-sm font-bold uppercase tracking-eyebrow text-white">
        Public launch · LIVE
      </p>
    );
  }

  return (
    <div className="inline-flex items-end gap-3 md:gap-5">
      {SLOTS.map((s) => (
        <div key={s.key} className="flex flex-col items-center">
          <span className="rounded-sm bg-white/10 px-4 py-3 text-3xl font-extrabold tabular-nums backdrop-blur-sm md:text-5xl">
            {String(t[s.key]).padStart(2, "0")}
          </span>
          <span className="mt-2 text-[10px] uppercase tracking-eyebrow opacity-70 md:text-xs">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
