import { HTMLAttributes } from "react";
import clsx from "clsx";

type Props = HTMLAttributes<HTMLSpanElement> & {
  color?: "yellow" | "pink" | "blue" | "green";
};

export default function ComicBadge({
  color = "yellow",
  className,
  children,
  ...props
}: Props) {
  const colors = {
    yellow: "bg-yellow-300 text-black",
    pink: "bg-[#b7ff3c] text-white",
    blue: "bg-[#1a1a1a] text-black",
    green: "bg-lime-300 text-black",
  };

  return (
    <span
      {...props}
      className={clsx(
        "inline-block",
        "border-4 border-black",
        "px-4 py-2",
        "font-black uppercase",
        "shadow-[5px_5px_0_#000]",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}