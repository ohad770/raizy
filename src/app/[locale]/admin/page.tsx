import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllCampaigns } from "@/lib/campaign-store";
import { AdminCampaignsTable } from "./admin-campaigns-table";

function formatNIS(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isHe = locale === "he";

  return {
    title: isHe ? "ניהול קמפיינים | Raizy" : "Campaign Admin | Raizy",
  };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isHe = locale === "he";
  const campaigns = await getAllCampaigns({ includeInactive: true });
  const activeCount = campaigns.filter((campaign) => campaign.isActive !== false).length;
  const inactiveCount = campaigns.length - activeCount;
  const totalRaised = campaigns.reduce(
    (sum, campaign) => sum + campaign.raisedAmount,
    0
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-primary-600">
            {isHe ? "ניהול" : "Admin"}
          </div>
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            {isHe ? "ניהול קמפיינים" : "Campaign Management"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {isHe
              ? "כאן אפשר להשבית קמפיין ציבורית או למחוק אותו לצמיתות."
              : "Disable public campaigns or permanently delete them from here."}
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 hover:-translate-y-0.5"
        >
          <span aria-hidden="true">+</span>
          {isHe ? "קמפיין חדש" : "New Campaign"}
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: isHe ? "קמפיינים פעילים" : "Active campaigns",
            value: activeCount.toLocaleString(locale === "he" ? "he-IL" : "en-US"),
          },
          {
            label: isHe ? "קמפיינים מושבתים" : "Disabled campaigns",
            value: inactiveCount.toLocaleString(locale === "he" ? "he-IL" : "en-US"),
          },
          {
            label: isHe ? "גויס בסך הכל" : "Total raised",
            value: formatNIS(totalRaised),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card px-5 py-4"
          >
            <div className="text-2xl font-extrabold text-foreground" dir="ltr">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <AdminCampaignsTable campaigns={campaigns} locale={locale} />
    </div>
  );
}
