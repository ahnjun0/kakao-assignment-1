"use client";

/*
 * /todos 하위에서 발생한 에러를 잡아 표시한다.
 * App Router 규약상 error.tsx는 반드시 Client Component여야 한다
 * (reset 함수로 다시 시도 인터랙션을 제공해야 하기 때문).
 */

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TodosError({ error, reset }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-700">문제가 발생했어요</h2>
      <p className="text-sm text-red-600">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="self-start rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:opacity-90"
      >
        다시 시도
      </button>
    </section>
  );
}
