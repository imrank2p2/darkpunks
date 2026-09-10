"use client";

import Link from "next/link";
import WalletButton from "@/components/WalletButton";

const links = [
  { name: "HOW IT WORKS", href: "#about" },
  { name: "ARENA", href: "#arena" },
  { name: "PLAYERS", href: "#gallery" },
  { name: "ACTIVITY", href: "#activity" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black bg-[#f4f0e6]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center border border-black bg-[#b7ff3c] font-mono text-sm font-black shadow-[3px_3px_0_#111]">HP</div>
          <div className="leading-none">
            <div className="font-mono text-[13px] font-black tracking-[.18em]">HOOD PLAYERS</div>
            <div className="mt-1 font-mono text-[9px] font-bold tracking-[.14em] text-black/50">PLAYER NETWORK / 4663</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link key={link.name} href={link.href} className="font-mono text-[10px] font-black tracking-[.12em] hover:text-[#74b900]">
              {link.name}
            </Link>
          ))}
          <WalletButton />
        </nav>

        <a href="https://opensea.io/collection/hood-players" target="_blank" rel="noopener noreferrer" className="border border-black bg-[#b7ff3c] px-4 py-2 font-mono text-[10px] font-black tracking-[.1em] shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]">
          VIEW COLLECTION ↗
        </a>
      </div>
    </header>
  );
}
