"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Summer26StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after the user scrolls past 80% of one viewport height
      setShow(window.scrollY > window.innerHeight * 0.8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 px-5 py-3 backdrop-blur transition-transform md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-wrap items-center justify-between gap-3">
        <div className="text-xs text-white/80">
          <p className="font-bold text-white">Summer ’26 · Pre-order</p>
          <p className="opacity-80">Try before you pay</p>
        </div>
        <Link href="#preorder" className="btn-pill btn-pill-primary !py-2 !px-4 !text-[11px]">
          Reserve →
        </Link>
      </div>
    </div>
  );
}
