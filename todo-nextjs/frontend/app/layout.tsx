import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo (3차 과제)",
  description: "Next.js + FastAPI 풀스택 Todo 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        {/* 화면 중앙 단일 컨테이너 — 2차 디자인 톤 그대로 가져온다. */}
        <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
