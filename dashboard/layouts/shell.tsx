"use client";

import { House, NotepadText, Star, TableOfContents, UserRound, Image, Video, NotebookPen, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import MainLayout from "./main-layout-components/main-layout";
import type { NavGroup } from "./main-layout-components/nav-main";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navigation: NavGroup[] = [{ id: 1, label: "القائمة", items: [
    { url: "/dashboard", title: t("home"), icon: House },
    { url: "/dashboard/services", title: t("services_title"), icon: NotepadText },
    { url: "/dashboard/faqs", title: t("faq_title"), icon: TableOfContents },
    { url: "/dashboard/our-specialists", title: t("our_specialists_title"), icon: UserRound },
    { url: "/dashboard/testimonials", title: t("testimonials_title"), icon: Star },
    { url: "/dashboard/gallery", title: t("gallery_title"), icon: Image },
    { url: "/dashboard/youtube-galleries", title: t("youtube_galleries_title"), icon: Video },
    { url: "/dashboard/blog-posts", title: t("blog_posts_title"), icon: NotebookPen },
  ] }, { id: 2, label: "الإعدادات", items: [
    { url: "/dashboard/settings", title: "إعدادات التطبيق", icon: Settings },
  ] }];
  return <MainLayout NAVIGATION={navigation}>{children}</MainLayout>;
}
