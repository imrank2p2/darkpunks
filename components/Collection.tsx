"use client";

import Image from "next/image";

const items = [
  { id: 1, image: "/nft1.png", rarity: "COMMON" },
  { id: 2, image: "/nft2.png", rarity: "RARE" },
  { id: 3, image: "/nft3.png", rarity: "EPIC" },
  { id: 4, image: "/nft4.png", rarity: "LEGENDARY" },
  { id: 5, image: "/nft5.png", rarity: "RARE" },
  { id: 6, image: "/nft6.png", rarity: "COMMON" },
];

export default function Collection() {
  return (
    <section id="gallery" className="border-b border-black bg-[#f4f0e6]">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-black pb-6 sm:flex-row sm:items-end">
          <div><div className="font-mono text-[9px] font-black tracking-[.18em] text-black/45">COLLECTION / 02</div><h2 className="mt-2 font-mono text-4xl font-black tracking-[-.05em] sm:text-6xl">THE PLAYERS</h2></div>
          <a href="https://opensea.io/collection/hood-players" target="_blank" rel="noopener noreferrer" className="w-fit border border-black bg-[#b7ff3c] px-4 py-2 font-mono text-[9px] font-black shadow-[3px_3px_0_#111]">VIEW ALL ↗</a>
        </div>
        <div className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="group bg-[#f4f0e6] p-3">
              <div className="relative overflow-hidden border border-black bg-white"><Image src={item.image} alt={`HOOD PLAYER #${item.id}`} width={600} height={600} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.025]" /><span className="absolute left-2 top-2 border border-black bg-[#b7ff3c] px-2 py-1 font-mono text-[8px] font-black">{item.rarity}</span></div>
              <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-4 font-mono"><div><div className="text-sm font-black">HOOD PLAYER #{String(item.id).padStart(4, "0")}</div><div className="mt-1 text-[8px] font-bold text-black/45">GENESIS PLAYER / 4663</div></div><a href="https://opensea.io/collection/hood-players" target="_blank" rel="noopener noreferrer" className="border border-black bg-black px-3 py-2 text-[8px] font-black text-white">VIEW</a></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
