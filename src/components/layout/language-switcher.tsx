"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const targetLocale = locale === "he" ? "en" : "he";

  function handleSwitch() {
    router.replace(pathname, { locale: targetLocale });
  }

  return (
    <button
      onClick={handleSwitch}
      className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
      aria-label={`Switch to ${targetLocale === "he" ? "Hebrew" : "English"}`}
    >
      {t("switchLanguage")}
    </button>
  );
}
