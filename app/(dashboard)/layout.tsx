import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import { DashboardProviders } from "@/dashboard/providers";
import { siteUrl } from "@/lib/seo-shared";
import "@/dashboard/styles/dashboard.css";

const readex = Readex_Pro({ subsets: ["arabic", "latin"], variable: "--font-readex-pro" });

export const metadata: Metadata = {
  title: "لوحة التحكم | LAPiS",
  metadataBase: new URL(siteUrl),
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl" className={readex.variable}>
    <body><DashboardProviders>{children}</DashboardProviders></body>
  </html>;
}
