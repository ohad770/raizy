import { notFound } from "next/navigation";
import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import {
  getCampaignBySlugFromStore,
  getAllCampaigns,
} from "@/lib/campaign-store";
import { formatNIS, formatTimeAgo } from "@/lib/mock-campaigns";
import { ProgressBar } from "@/components/campaign/progress-bar";
import {
  DonationButton,
  type DonationCampaignProps,
} from "@/components/donation/donation-button";
import { routing } from "@/i18n/routing";
import { CampaignCreatedToast } from "./campaign-created-toast";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllCampaigns().map((c) => ({ locale, slug: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const campaign = getCampaignBySlugFromStore(slug);
  if (!campaign) return {};

  const pct = Math.round((campaign.raisedAmount / campaign.goalAmount) * 100);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";

  return {
    title: campaign.title,
    description: campaign.shortDescription,
    openGraph: {
      title: campaign.title,
      description: `${formatNIS(campaign.raisedAmount)} גויסו (${pct}%) · ${campaign.donorCount} תורמים`,
      url: `${appUrl}/${locale}/${slug}`,
      type: "website",
      images: [
        {
          url: `${appUrl}/api/og?slug=${slug}&locale=${locale}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const campaign = getCampaignBySlugFromStore(slug);
  if (!campaign) notFound();

  const t = await getTranslations({ locale, namespace: "campaign" });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  const campaignUrl = `${appUrl}/${locale}/${slug}`;

  const donationCampaign: DonationCampaignProps = {
    id: campaign.id,
    slug: campaign.slug,
    title: campaign.title,
    donorCount: campaign.donorCount,
    raisedAmount: campaign.raisedAmount,
    goalAmount: campaign.goalAmount,
  };

  return (
    <>
      <Suspense>
        <CampaignCreatedToast locale={locale} slug={slug} />
      </Suspense>

      {/* ── Hero ── */}
      <div
        className="relative w-full"
        style={{
          height: "clamp(220px, 40vw, 380px)",
          background: `linear-gradient(135deg, ${campaign.gradientFrom} 0%, ${campaign.gradientTo} 100%)`,
        }}
      >
        {campaign.heroImageDataUrl && (
          <img
            src={campaign.heroImageDataUrl}
            alt={campaign.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute bottom-0 start-0 end-0 p-5 sm:p-8">
          <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {campaign.category}
          </span>
          <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
            {campaign.title}
          </h1>
          <p className="mt-1.5 text-sm text-white/80 line-clamp-2 max-w-lg">
            {campaign.shortDescription}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      {/* pb-32 leaves room for the sticky donate bar */}
      <div className="mx-auto max-w-2xl px-4 pb-32">

        {/* Progress */}
        <section className="border-b border-border py-6">
          <ProgressBar
            raisedAmount={campaign.raisedAmount}
            goalAmount={campaign.goalAmount}
            donorCount={campaign.donorCount}
          />
          {campaign.endsInDays !== undefined && (
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold text-foreground" dir="ltr">
                {campaign.endsInDays}
              </span>{" "}
              {t("daysLeft")}
            </p>
          )}
        </section>

        {/* Creator */}
        <section className="flex items-center gap-3 border-b border-border py-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: campaign.gradientFrom }}
            aria-hidden="true"
          >
            {campaign.creatorName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {campaign.creatorName}
            </p>
            <p className="text-xs text-muted">
              {t("createdBy")} ·{" "}
              {locale === "he"
                ? `לפני ${campaign.createdDaysAgo} ימים`
                : `${campaign.createdDaysAgo} days ago`}
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="border-b border-border py-6">
          <div className="whitespace-pre-wrap text-sm leading-loose text-foreground">
            {campaign.story}
          </div>
        </section>

        {/* Recent donations */}
        <section className="py-6">
          <h2 className="mb-4 text-base font-bold text-foreground">
            {t("recentDonations")}
          </h2>

          {campaign.recentDonations.length === 0 ? (
            <p className="text-sm text-muted">{t("noDonationsYet")}</p>
          ) : (
            <ul className="space-y-4">
              {campaign.recentDonations.map((d) => (
                <li key={d.id} className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-muted">
                    {d.isAnonymous ? "?" : <bdi>{d.displayName.charAt(0)}</bdi>}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <bdi className="text-sm font-semibold text-foreground">
                        {d.isAnonymous ? t("anonymous") : d.displayName}
                      </bdi>
                      <span
                        className="shrink-0 text-sm font-bold text-primary-600"
                        dir="ltr"
                      >
                        {formatNIS(d.amount)}
                      </span>
                    </div>
                    {d.message && (
                      <p className="mt-0.5 text-xs text-muted">{d.message}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-light">
                      {formatTimeAgo(d.createdAtMs)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Share */}
        <section className="border-t border-border py-5">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {t("share")}
          </p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `${campaign.title}\n${campaign.shortDescription}\n${campaignUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#25D366" }}
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t("shareOnWhatsapp")}
          </a>
        </section>

        {/* Report */}
        <div className="border-t border-border py-4">
          <button className="text-xs text-muted transition-colors hover:text-error-500">
            {t("report")}
          </button>
        </div>
      </div>

      {/* ── Sticky donate button + sheet ── */}
      <DonationButton
        campaign={donationCampaign}
        locale={locale}
        campaignUrl={campaignUrl}
      />
    </>
  );
}
