import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DARK PUNKS",
  description: "DARK PUNKS reward protocol on Robinhood Chain.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
