import { createResourceHandler } from "@/server/backend/http/content-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createResourceHandler("BlogPosts", "list");
export async function GET(request: Request) {
  return handler(request);
}
