import { createUserHandler } from "@/server/backend/http/auth-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createUserHandler("get-info");
export async function GET(request: Request) {
  return handler(request);
}
