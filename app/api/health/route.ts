import { databaseHealth } from "@/server/backend/db/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await databaseHealth();
  return Response.json(health, {
    status: health.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
