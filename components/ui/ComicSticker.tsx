import { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  color?: "yellow" | "pink" | "blue" | "green" | "white";
  rotate?: string;
  className?: string;
};

export default function ComicSticker({
  children,
  color = "yellow",
  rotate = "-rotate-6",
  className,
}: Props) {
  const colors = {
    yellow: "bg-yellow-300 text-black",
    pink: "bg-[#b7ff3c] text-white",
    blue: "bg-[#1a1a1a] text-black",
    green: "bg-lime-300 text-black",
    white: "bg-white text-black",
  };

  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center",
        "border-4 border-black",
        "px-5 py-3",
        "font-black uppercase",
        "shadow-[6px_6px_0_#000]",
        rotate,
        colors[color],
        className
      )}
    >
      {children}
    </div>
  );
}