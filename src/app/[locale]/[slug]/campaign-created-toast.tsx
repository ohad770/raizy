"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface Props {
  locale: string;
  slug: string;
}

export function CampaignCreatedToast({ slug }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("create");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);

  const created = searchParams.get("created") === "1";

  useEffect(() => {
    if (!created) return;

    // Strip the ?created=1 param after 4 s, then fade out the toast
    timerRef.current = setTimeout(() => {
      // Fade out
      if (toastRef.current) {
        toastRef.current.style.opacity = "0";
        toastRef.current.style.transform = "translateY(-12px)";
      }
      setTimeout(() => {
        router.replace(`/${slug}`, { scroll: false });
      }, 300);
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [created, router, slug]);

  if (!created) return null;

  return (
    <div
      ref={toastRef}
      role="status"
      aria-live="polite"
      className="fixed top-4 start-1/2 z-50 -translate-x-1/2 rounded-xl bg-success-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300"
      style={{
        // Fallback for browsers without logical property support on translate
        transform: "translateX(-50%)",
      }}
    >
      {t("successToast")}
    </div>
  );
}
