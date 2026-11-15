"use client";

import { MainContainer } from "@/dashboard/components";
import { logoWhiteBg } from "@/dashboard/assets";

export default function DashboardPage() {
  return <MainContainer><div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
    <img className="w-[250] object-cover" src={logoWhiteBg} alt="logo" />
  </div></MainContainer>;
}
