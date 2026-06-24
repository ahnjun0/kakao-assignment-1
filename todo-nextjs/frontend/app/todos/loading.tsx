/**
 * /todos 하위 페이지가 서버에서 데이터를 불러오는 동안 표시되는 fallback.
 * Next.js App Router의 컨벤션 — Server Component로 둔다.
 */
export default function Loading() {
  return (
    <section className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p>불러오는 중...</p>
    </section>
  );
}
