import { redirect } from "next/navigation";

/**
 * 루트 페이지(`/`).
 * 본 앱은 `/todos`가 사실상 첫 화면이므로 별도 안내 페이지 없이 즉시 리다이렉트한다.
 * Server Component(기본)에서 호출하는 redirect 헬퍼라 클라이언트 점프가 아닌
 * 서버 응답 단계의 302/307 리다이렉트로 처리된다.
 */
export default function Home() {
  redirect("/todos");
}
