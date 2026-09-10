"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const ticker = ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA", "META", "GOOGL", "AMD", "NFLX", "JPM", "V", "COST"];

export default function Hero() {
  const [holders, setHolders] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/activity", { cache: "no-store" });
        const data = await response.json();
        if (active && Number.isFinite(Number(data.holders))) setHolders(Number(data.holders));
      } catch {}
    };
    load();
    const timer = window.setInterval(load, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return (
    <>
      <div className="border-b border-black bg-black py-2 text-white">
        <div className="ticker-track mx-auto flex w-max gap-8 font-mono text-[10px] font-bold tracking-[.12em]">
          {[...ticker, ...ticker].map((symbol, i) => <span key={i} className="whitespace-nowrap">{symbol} <b className="text-[#b7ff3c]">+0.{(i % 8) + 2}%</b></span>)}
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-black bg-[#f4f0e6]">
        <div className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
        <div className="relative mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr_.72fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 border border-black bg-[#b7ff3c] px-3 py-1 font-mono text-[9px] font-black tracking-[.16em] shadow-[3px_3px_0_#111]">
                <span className="h-2 w-2 rounded-full bg-black" /> PLAYER NETWORK ONLINE
              </div>
              <h1 className="font-mono text-[54px] font-black leading-[.88] tracking-[-.07em] sm:text-7xl lg:text-[86px]">
                HOOD<br /><span className="text-[#77b900]">PLAYERS</span>
              </h1>
              <p className="mt-7 max-w-xl font-mono text-sm font-bold leading-6 text-black/65 sm:text-base">
                On-chain players built for the hood. Own a Player, send it into the Arena and build its story on Robinhood Chain.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#arena" className="border border-black bg-black px-5 py-3 font-mono text-[10px] font-black tracking-[.12em] text-white shadow-[4px_4px_0_#b7ff3c]">ENTER ARENA</a>
                <a href="https://opensea.io/collection/hood-players" target="_blank" rel="noopener noreferrer" className="border border-black bg-white px-5 py-3 font-mono text-[10px] font-black tracking-[.12em] shadow-[4px_4px_0_#111]">OPEN OPENSEA ↗</a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -left-3 top-8 border border-black bg-white px-3 py-2 font-mono text-[9px] font-black shadow-[3px_3px_0_#111] sm:-left-8">PLAYER #0001</div>
              <div className="border border-black bg-[#b7ff3c] p-3 shadow-[10px_10px_0_#111] sm:p-5">
                <div className="relative overflow-hidden border border-black bg-white">
                  <Image src="/nft.png" alt="HOOD PLAYERS #0001" width={600} height={600} priority className="aspect-square w-full object-cover" />
                  <div className="absolute bottom-3 left-3 border border-black bg-black px-3 py-2 font-mono text-[9px] font-black text-[#b7ff3c]">STATUS: READY</div>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-2 border border-black bg-black px-4 py-2 font-mono text-[9px] font-black text-white shadow-[4px_4px_0_#b7ff3c]">CHAIN 4663 / ERC-721</div>
            </div>

            <div className="grid gap-2 font-mono">
              <div className="border border-black bg-white p-4 shadow-[3px_3px_0_#111]"><div className="text-[9px] font-bold text-black/45">SUPPLY</div><div className="mt-2 text-3xl font-black">2,600</div><div className="mt-1 text-[9px] font-bold">PLAYERS</div></div>
              <div className="border border-black bg-white p-4 shadow-[3px_3px_0_#111]"><div className="text-[9px] font-bold text-black/45">HOLDERS</div><div className="mt-2 text-3xl font-black">{holders.toLocaleString()}</div><div className="mt-1 text-[9px] font-bold">READ FROM CHAIN</div></div>
              <div className="border border-black bg-black p-4 text-white shadow-[3px_3px_0_#b7ff3c]"><div className="text-[9px] font-bold text-white/45">ARENA</div><div className="mt-2 text-3xl font-black text-[#b7ff3c]">08:00:00</div><div className="mt-1 text-[9px] font-bold">SESSION LENGTH</div></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
