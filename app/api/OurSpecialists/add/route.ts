import { createResourceHandler } from "@/server/backend/http/content-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createResourceHandler("OurSpecialists", "create");
export async function POST(request: Request) {
  return handler(request);
}
