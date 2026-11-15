import { createAuthHandler } from "@/server/backend/http/auth-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = createAuthHandler("confirm-email");
