import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AURA Toolbox",
  description: "ศูนย์รวมเครื่องมืออเนกประสงค์สำหรับงานไฟล์และครีเอทีฟโฟลว์"
};

export default function RootLayout({
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
      <body>{children}</body>
    </html>
  );
}
