import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

function clientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "unknown";
}

function requestId(request: NextRequest) {
  return request.headers.get("x-request-id") || request.headers.get("x-correlation-id") || crypto.randomUUID();
}

function shouldSkip(pathname: string) {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico" || pathname === "/health" || pathname === "/healthz") return true;
  return /\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|mov|mp4|otf|png|svg|ttf|webp|woff|woff2)$/i.test(pathname);
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const startedAt = performance.now();
  const id = requestId(request);
  const response = NextResponse.next();
  response.headers.set("x-request-id", id);

  if (!shouldSkip(request.nextUrl.pathname)) {
    const logUrl = new URL("/api/request-log", request.url);
    event.waitUntil(fetch(logUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-request-log": "1",
      },
      body: JSON.stringify({
        type: "page_request",
        timestamp: new Date().toISOString(),
        method: request.method,
        route: request.nextUrl.pathname,
        status_code: response.status,
        duration_ms: Math.round(performance.now() - startedAt),
        client_ip: clientIp(request),
        user_agent: request.headers.get("user-agent") || "unknown",
        referer: request.headers.get("referer") || "",
        request_id: id,
      }),
    }).catch(() => undefined));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
