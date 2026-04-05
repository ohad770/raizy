"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-600">Raizy</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary-600 ${
              pathname === "/" ? "text-primary-600" : "text-muted"
            }`}
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/explore"
            className="text-sm font-medium text-muted transition-colors hover:text-primary-600"
          >
            {t("nav.explore")}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            {t("nav.createCampaign")}
          </Link>
        </div>
      </div>
    </header>
  );
}
