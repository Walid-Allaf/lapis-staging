import { createResourceHandler } from "@/server/backend/http/content-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createResourceHandler("Galleries", "delete");
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  return handler(request, (await context.params).id);
}
