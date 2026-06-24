import Link from "next/link";

/**
 * 루트 페이지. 별도 콘텐츠 없이 /todos로 안내한다.
 * Server Component(기본)로 둔다 — 인터랙션이 없으므로 "use client" 불필요.
 */
export default function Home() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-3xl font-semibold text-primary">Todo 풀스택</h1>
      <p className="text-zinc-600">
        Next.js App Router + FastAPI로 만든 3차 과제 Todo 앱입니다.
      </p>
      <Link
        href="/todos"
        className="rounded-full bg-primary px-6 py-3 text-white transition hover:opacity-90"
      >
        Todo 목록 보기
      </Link>
    </section>
  );
}
