import { createSingletonHandler } from "@/server/backend/http/content-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const PUT = createSingletonHandler("ads-edit");
