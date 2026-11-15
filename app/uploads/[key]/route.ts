import { createMediaHandler } from "@/server/backend/http/file-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handle = createMediaHandler();
export async function GET(request: Request, context: { params: Promise<{ key: string }> }) {
  return handle(request, (await context.params).key);
}
export async function HEAD(request: Request, context: { params: Promise<{ key: string }> }) {
  return handle(request, (await context.params).key);
}
