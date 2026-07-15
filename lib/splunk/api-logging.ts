import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { sendSplunkEvent } from "@/lib/splunk/hec";

type RouteContext = { params?: Promise<Record<string, string | string[]>> };
type ApiHandler<Context extends RouteContext | undefined = undefined> = Context extends RouteContext
  ? (request: NextRequest, context: Context) => Response | Promise<Response>
  : (request: NextRequest) => Response | Promise<Response>;

type ApiEventFields = Record<string, unknown>;

function clientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "unknown";
}

function requestId(request: Request) {
  return request.headers.get("x-request-id") || request.headers.get("x-correlation-id") || randomUUID();
}

export function logApiEvent(request: Request, route: string, statusCode: number, durationMs: number, fields: ApiEventFields = {}) {
  const id = typeof fields.request_id === "string" ? fields.request_id : requestId(request);
  sendSplunkEvent({
    type: "api_request",
    timestamp: new Date().toISOString(),
    method: request.method,
    route,
    status_code: statusCode,
    duration_ms: Math.round(durationMs),
    client_ip: clientIp(request),
    user_agent: request.headers.get("user-agent") || "unknown",
    referer: request.headers.get("referer") || "",
    request_id: id,
    ...fields,
  });
}

export function logAppEvent(type: string, fields: ApiEventFields = {}) {
  sendSplunkEvent({ type, ...fields });
}

export function withApiLogging<Context extends RouteContext | undefined = undefined>(
  route: string,
  handler: ApiHandler<Context>,
): ApiHandler<Context> {
  return (async (request: NextRequest, context?: Context) => {
    const startedAt = performance.now();
    const id = requestId(request);
    try {
      const response = context ? await handler(request, context) : await (handler as ApiHandler)(request);
      response.headers.set("x-request-id", id);
      logApiEvent(request, route, response.status, performance.now() - startedAt, {
        request_id: id,
        error: response.status >= 500,
      });
      return response;
    } catch (error) {
      logApiEvent(request, route, 500, performance.now() - startedAt, {
        request_id: id,
        error: true,
        error_message: error instanceof Error ? error.message : "Unhandled API error",
      });
      throw error;
    }
  }) as ApiHandler<Context>;
}
