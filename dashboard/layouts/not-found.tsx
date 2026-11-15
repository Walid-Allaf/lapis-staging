"use client";

import Link from "next/link";

export function DashboardNotFound() {
  return <main className="grid min-h-[70vh] place-content-center gap-4 text-center">
    <h1 className="text-3xl font-bold">404</h1>
    <p>الصفحة غير موجودة</p>
    <Link href="/dashboard" className="text-primary underline">العودة إلى الرئيسية</Link>
  </main>;
}
