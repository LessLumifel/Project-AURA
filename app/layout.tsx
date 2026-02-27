import "./globals.css";
import "@mdxeditor/editor/style.css";
import type { Metadata } from "next";
import AuthStatus from "./components/AuthStatus";

export const metadata: Metadata = {
  title: "AURA Toolbox",
  description: "ศูนย์รวมเครื่องมืออเนกประสงค์สำหรับงานไฟล์และครีเอทีฟโฟลว์",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <a
          href="/"
          aria-label="กลับหน้าแรก"
          className="fixed left-3 top-3 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300/80 bg-white p-2 shadow-sm transition hover:border-slate-400"
        >
          <img src="/icon.svg" alt="AURA Home" className="h-7 w-7" />
        </a>
        <AuthStatus />
        <div className="min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-8">{children}</div>
      </body>
    </html>
  );
}




