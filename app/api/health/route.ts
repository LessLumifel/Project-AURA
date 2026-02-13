import { jsonResponse } from "../../../lib/api/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  return jsonResponse(
    {
      ok: true,
      service: "project-aura",
      now: new Date().toISOString(),
      uptimeSec: Math.floor(process.uptime())
    },
    {
      route: "GET /api/health",
      startMs: start,
      cacheControl: "no-store"
    }
  );
}
