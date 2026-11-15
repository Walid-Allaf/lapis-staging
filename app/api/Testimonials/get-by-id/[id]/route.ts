import { createResourceHandler } from "@/server/backend/http/content-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createResourceHandler("Testimonials", "detail");
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handler(request, (await context.params).id);
}
