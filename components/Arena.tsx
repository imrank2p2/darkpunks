"use client";

import { useEffect, useState } from "react";

const ARENA_SECONDS = 8 * 60 * 60;
const STORAGE_KEY = "hood-players-arena-v2";

function formatTime(total: number) {
  const h = Math.floor(total / 3600).toString().padStart(2, "0");
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Arena() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setStartedAt(Number(saved));
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsed = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const remaining = Math.max(0, ARENA_SECONDS - elapsed);
  const active = startedAt !== null && remaining > 0;
  const complete = startedAt !== null && remaining === 0;
  const progress = Math.min(100, (elapsed / ARENA_SECONDS) * 100);

  function enterArena() {
    const t = Date.now();
    setStartedAt(t);
    localStorage.setItem(STORAGE_KEY, String(t));
  }
  function claim() {
    setStartedAt(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <section id="arena" className="border-b border-black bg-[#e9e4d8]">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div><div className="font-mono text-[9px] font-black tracking-[.18em] text-black/45">PLAYER OPERATIONS / 01</div><h2 className="mt-2 font-mono text-4xl font-black tracking-[-.05em] sm:text-6xl">THE ARENA</h2></div>
          <div className="hidden border border-black bg-[#b7ff3c] px-3 py-2 font-mono text-[9px] font-black sm:block">TESTNET MODE / FREE</div>
        </div>

        <div className="grid border border-black bg-white shadow-[7px_7px_0_#111] lg:grid-cols-[1.1fr_.9fr]">
          <div className="border-b border-black p-6 sm:p-9 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between font-mono text-[9px] font-black"><span>PLAYER #0001</span><span className={active ? "text-[#6da900]" : "text-black/40"}>{active ? "● IN THE ARENA" : complete ? "● COMPLETE" : "○ OUTSIDE"}</span></div>
            <div className="mt-10 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
              <div className="border border-black bg-[#b7ff3c] p-2"><img src="/nft.png" alt="Player" className="aspect-square w-full object-cover border border-black" /></div>
              <div><div className="font-mono text-[10px] font-bold text-black/45">SESSION</div><div className="mt-2 font-mono text-5xl font-black tracking-[-.06em]">8 HOURS</div><p className="mt-4 max-w-md font-mono text-xs font-bold leading-6 text-black/60">Put your Player in the Arena. This prototype stores the session locally. Blockchain locking and real rewards come next.</p></div>
            </div>
            <div className="mt-9 h-3 border border-black bg-[#eee9de] p-[2px]"><div className="h-full bg-[#b7ff3c]" style={{ width: `${progress}%` }} /></div>
            <div className="mt-2 flex justify-between font-mono text-[9px] font-black"><span>{Math.floor(progress)}% COMPLETE</span><span>{complete ? "READY TO CLAIM" : active ? "SESSION RUNNING" : "READY TO ENTER"}</span></div>
          </div>
          <div className="bg-black p-6 text-white sm:p-9">
            <div className="font-mono text-[9px] font-black tracking-[.16em] text-[#b7ff3c]">ARENA CLOCK</div>
            <div className="mt-4 font-mono text-5xl font-black tracking-[-.06em] sm:text-6xl">{formatTime(remaining)}</div>
            <div className="mt-7 grid grid-cols-2 gap-2 font-mono text-[9px] font-black"><div className="border border-white/20 p-3"><div className="text-white/40">STATUS</div><div className="mt-2">{complete ? "COMPLETE" : active ? "ACTIVE" : "READY"}</div></div><div className="border border-white/20 p-3"><div className="text-white/40">REWARD</div><div className="mt-2 text-[#b7ff3c]">{complete ? "100 TEST" : active ? "EARNING" : "--"}</div></div></div>
            {!active && !complete && <button onClick={enterArena} className="mt-7 w-full border border-black bg-[#b7ff3c] px-5 py-4 font-mono text-[10px] font-black tracking-[.14em] text-black shadow-[4px_4px_0_#fff]">ENTER ARENA →</button>}
            {complete && <button onClick={claim} className="mt-7 w-full border border-white bg-white px-5 py-4 font-mono text-[10px] font-black tracking-[.14em] text-black shadow-[4px_4px_0_#b7ff3c]">CLAIM TEST REWARD →</button>}
            {active && <div className="mt-7 border border-[#b7ff3c] p-4 font-mono text-[9px] font-bold leading-5 text-[#b7ff3c]">PLAYER IS ACTIVE. BLOCKCHAIN LOCKING WILL BE ENABLED IN THE NEXT CONTRACT VERSION.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
