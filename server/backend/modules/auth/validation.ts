import "server-only";
import { z } from "zod";

const optionalText = z.string().nullable().optional();
const optionalEmail = z.email().nullable().optional();
export const authSchemas = {
  register: z.object({ firstName: z.string().min(1), lastName: z.string().min(1), email: z.email().min(1), password: z.string().min(1), phoneNumber: z.string().min(1), country: optionalText }).strict(),
  login: z.object({ email: optionalText, password: optionalText, code: optionalText }).strict(),
  "confirm-email": z.object({ email: optionalText, code: optionalText }).strict(),
  "reset-password": z.object({ email: z.email().min(1), code: z.string().min(1), newPassword: z.string().min(6).max(20) }).strict(),
  "send-otp": z.object({ email: z.email().min(1), purpose: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional() }).strict(),
  "verify-otp": z.object({ email: optionalEmail, code: z.string().length(6).nullable().optional() }).strict(),
  "toggle-2fa": z.object({}).strict(),
} as const;
export const userSchemas = {
  "change-password": z.object({ currentPassword: optionalText, newPassword: optionalText }).strict(),
  "edit-profile": z.object({ firstName: optionalText, lastName: optionalText, phoneNumber: optionalText, fileId: z.int32().nullable().optional() }).strict(),
  "toggle-disable": z.object({ email: z.string().min(1) }).strict(),
} as const;
export type RegisterInput = z.infer<typeof authSchemas.register>;
export type LoginInput = z.infer<typeof authSchemas.login>;
export type ProfileInput = z.infer<typeof userSchemas["edit-profile"]>;
