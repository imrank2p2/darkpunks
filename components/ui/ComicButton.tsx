import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";


type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "yellow" | "pink" | "blue" | "white";
};

export default function ComicButton({
  variant = "yellow",
  className,
  children,
  ...props
}: Props) {
  const colors = {
    yellow: "bg-yellow-300 text-black",
    pink: "bg-[#b7ff3c] text-white",
    blue: "bg-[#1a1a1a] text-black",
    white: "bg-white text-black",
  };

  return (
    <button
      {...props}
      className={clsx(
        "border-4 border-black px-8 py-4",
        "font-black uppercase",
        "shadow-[6px_6px_0_#000]",
        "transition-all duration-150",
        "hover:translate-x-[2px]",
        "hover:translate-y-[2px]",
        "hover:shadow-none",
        colors[variant],
        className
      )}
    >
      {children}
    </button>
  );
}