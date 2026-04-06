import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getAllCampaigns } from "@/lib/campaign-store";
import { routing } from "@/i18n/routing";
import { ExploreGrid } from "./explore-grid";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isHe = locale === "he";
  return {
    title: isHe ? "גלה קמפיינים | Raizy" : "Explore Campaigns | Raizy",
    description: isHe
      ? "גלה קמפיינים פעילים בישראל. רפואי, קהילה, חינוך ועוד."
      : "Browse active crowdfunding campaigns in Israel. Medical, community, education and more.",
  };
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isHe = locale === "he";
  const campaigns = await getAllCampaigns();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-20">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-primary-600">
            {isHe ? "כל הקמפיינים" : "All Campaigns"}
          </div>
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            {isHe ? "גלה קמפיינים" : "Explore Campaigns"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isHe
              ? "עיין בקמפיינים הפעילים וגלה את המטרות שחשובות לך"
              : "Browse active campaigns and discover causes that matter to you"}
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 hover:-translate-y-0.5"
        >
          {isHe ? "✨ פתח קמפיין" : "✨ Start a Campaign"}
        </Link>
      </div>

      {/* ── Grid with search + filters ── */}
      <ExploreGrid campaigns={campaigns} locale={locale} />
    </div>
  );
}
