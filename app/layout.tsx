import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SparkDesk — Your All-in-One AI Workspace",
  description:
    "Chat, write, and design — powered by AI, all in one clean workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Inter:wght@300;400;500;600&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body text-ink-900 antialiased">{children}</body>
    </html>
  );
}
