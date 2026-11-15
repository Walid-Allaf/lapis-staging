import { createUserHandler } from "@/server/backend/http/auth-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createUserHandler("edit-profile");
export async function PUT(request: Request) {
  return handler(request);
}
