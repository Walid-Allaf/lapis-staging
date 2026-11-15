import { createUserHandler } from "@/server/backend/http/auth-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createUserHandler("change-password");
export async function POST(request: Request) {
  return handler(request);
}
