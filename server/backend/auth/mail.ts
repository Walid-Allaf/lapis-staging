import "server-only";
import nodemailer from "nodemailer";
import { unavailable } from "./errors";

export interface MailAdapter { sendOtp(email: string, purpose: number, code: string): Promise<void> }
export function smtpMailAdapter(env: NodeJS.ProcessEnv = process.env): MailAdapter {
  const host = env.SMTP_HOST, user = env.SMTP_USER, pass = env.SMTP_PASSWORD, from = env.SMTP_FROM;
  const port = Number(env.SMTP_PORT ?? "587");
  const secure = env.SMTP_SECURE === "true";
  if (!host || !user || !pass || !from || /[\r\n]/.test(from) || !Number.isInteger(port) || port < 1 || port > 65535 ||
    (env.SMTP_SECURE !== undefined && !["true", "false"].includes(env.SMTP_SECURE))) throw unavailable();
  const transport = nodemailer.createTransport({ host, port, secure, requireTLS: !secure,
    auth: { user, pass }, tls: { rejectUnauthorized: true }, connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000 });
  return {
    async sendOtp(email, purpose, code) {
      try {
        const result = await transport.sendMail({ from, to: email, subject: "LAPiS verification",
          text: `Your LAPiS verification code is ${code}. It expires in 5 minutes. Purpose ${purpose}. If you did not request it, ignore this message.`,
          disableFileAccess: true, disableUrlAccess: true });
        if (!result.accepted?.length || result.rejected?.length) throw unavailable();
      } catch { throw unavailable(); }
    },
  };
}
