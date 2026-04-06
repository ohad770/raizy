import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { CampaignForm } from "./campaign-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "create" });
  return {
    title: t("title"),
    description:
      locale === "he"
        ? "צור קמפיין גיוס כספים ב-2 דקות. שתף בוואטסאפ ותן לקהילה לעזור."
        : "Create a fundraising campaign in 2 minutes. Share on WhatsApp and let your community help.",
  };
}

export default async function CreateCampaignPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "create" });
  const isHe = locale === "he";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isHe
            ? "מלא את הפרטים ותוך 2 דקות הקמפיין שלך יהיה חי."
            : "Fill in the details and your campaign will be live in 2 minutes."}
        </p>
      </div>

      <CampaignForm locale={locale} />
    </div>
  );
}
