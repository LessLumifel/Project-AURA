type JsonOptions = {
  status?: number;
  startMs?: number;
  cacheControl?: string;
  route: string;
};

function createRequestId() {
  return crypto.randomUUID().slice(0, 12);
}

export function jsonResponse(payload: unknown, options: JsonOptions) {
  const requestId = createRequestId();
  const response = Response.json(payload, { status: options.status ?? 200 });
  response.headers.set("x-request-id", requestId);
  if (options.cacheControl) {
    response.headers.set("cache-control", options.cacheControl);
  }
  if (typeof options.startMs === "number") {
    const duration = Date.now() - options.startMs;
    response.headers.set("server-timing", `app;dur=${duration}`);
    console.info(`[api] ${options.route} request_id=${requestId} status=${options.status ?? 200} duration_ms=${duration}`);
  } else {
    console.info(`[api] ${options.route} request_id=${requestId} status=${options.status ?? 200}`);
  }
  return response;
}
