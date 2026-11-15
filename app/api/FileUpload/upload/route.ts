import { createUploadHandler } from "@/server/backend/http/file-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = createUploadHandler();
