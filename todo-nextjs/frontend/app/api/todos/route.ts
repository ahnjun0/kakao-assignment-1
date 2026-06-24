/**
 * /api/todos 프록시 (API Route).
 *
 * 클라이언트가 직접 HTTP로 부르는 진입점이다. 예: 도전 미션에서 클라이언트가
 * `fetch('/api/todos?filter=active')`로 호출하면 그 요청을 그대로 FastAPI로 위임한다.
 *
 * Server Action(actions.ts)과 달리 외부에서 HTTP로 들어오는 경로이므로
 * 일반적인 NextResponse 형태로 응답한다.
 *
 * 미션 5 시점에는 단순한 GET/POST 프록시만 둔다.
 * 도전 1에서 GET이 search params(filter/search)도 그대로 위임하도록 확장한다.
 */

import { NextResponse } from "next/server";

import { BACKEND_URL } from "@/app/lib/api";

export async function GET(request: Request): Promise<NextResponse> {
  // 들어온 query string을 그대로 백엔드에 넘긴다 (도전 미션 대비).
  const incomingUrl = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/todos${incomingUrl.search}`;

  const response = await fetch(targetUrl, { cache: "no-store" });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();
  const response = await fetch(`${BACKEND_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
