import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SparkDesk — Your All-in-One AI Workspace",
  description:
    "Chat, write, and outline presentations powered by AI — all in one clean workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
