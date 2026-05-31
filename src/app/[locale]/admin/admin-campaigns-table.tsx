"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import type { MockCampaign } from "@/lib/mock-campaigns";

interface AdminCampaignsTableProps {
  campaigns: MockCampaign[];
  locale: string;
}

type AdminAction = "activate" | "disable" | "delete";

function formatNIS(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | undefined, locale: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminCampaignsTable({
  campaigns,
  locale,
}: AdminCampaignsTableProps) {
  const router = useRouter();
  const isHe = locale === "he";
  const [localCampaigns, setLocalCampaigns] = useState(campaigns);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocalCampaigns(campaigns);
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return localCampaigns.filter((campaign) => {
      const isActive = campaign.isActive !== false;
      if (status === "active" && !isActive) return false;
      if (status === "inactive" && isActive) return false;

      if (!normalizedQuery) return true;
      return [
        campaign.title,
        campaign.titleEn,
        campaign.slug,
        campaign.creatorName,
        campaign.shortDescription,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    });
  }, [localCampaigns, query, status]);

  async function runAction(
    campaign: MockCampaign,
    action: AdminAction,
    nextActive?: boolean
  ) {
    const confirmText =
      action === "delete"
        ? isHe
          ? `למחוק את "${campaign.title}" לצמיתות?`
          : `Permanently delete "${campaign.title}"?`
        : null;

    if (confirmText && !window.confirm(confirmText)) return;

    setPendingId(campaign.id);
    setMessage(null);

    const endpoint = `/api/admin/campaigns/${encodeURIComponent(campaign.id)}`;
    const res = await fetch(
      action === "delete"
        ? `${endpoint}?slug=${encodeURIComponent(campaign.slug)}`
        : endpoint,
      {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers:
        action === "delete" ? undefined : { "Content-Type": "application/json" },
      body:
        action === "delete"
          ? undefined
          : JSON.stringify({
              isActive: Boolean(nextActive),
              slug: campaign.slug,
            }),
      }
    );

    setPendingId(null);

    if (!res.ok) {
      setMessage(
        isHe
          ? "הפעולה נכשלה. בדוק שהקמפיין עדיין קיים ושהרשאות השרת תקינות."
          : "The action failed. Check that the campaign still exists and server permissions are configured."
      );
      return;
    }

    const result = (await res.json()) as {
      campaign?: { isActive?: boolean; disabledAt?: string };
    };

    setLocalCampaigns((currentCampaigns) =>
      action === "delete"
        ? currentCampaigns.filter((item) => item.id !== campaign.id)
        : currentCampaigns.map((item) =>
            item.id === campaign.id && item.slug === campaign.slug
              ? {
                  ...item,
                  isActive: result.campaign?.isActive ?? Boolean(nextActive),
                  disabledAt: result.campaign?.disabledAt,
                }
              : item
          )
    );

    setMessage(
      action === "delete"
        ? isHe
          ? "הקמפיין נמחק."
          : "Campaign deleted."
        : nextActive
          ? isHe
            ? "הקמפיין הופעל."
            : "Campaign activated."
          : isHe
            ? "הקמפיין הושבת."
            : "Campaign disabled."
    );

    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="relative">
          <svg
            className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isHe ? "חפש לפי שם, יוצר או כתובת..." : "Search title, creator or slug..."}
            className="w-full rounded-xl border border-border bg-card py-3 ps-11 pe-4 text-base text-foreground placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="flex rounded-xl border border-border bg-card p-1">
          {[
            { value: "all", label: isHe ? "הכל" : "All" },
            { value: "active", label: isHe ? "פעילים" : "Active" },
            { value: "inactive", label: isHe ? "מושבתים" : "Disabled" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setStatus(item.value as typeof status)}
              className={`min-w-20 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                status === item.value
                  ? "bg-primary-600 text-white"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-[minmax(220px,1fr)_130px_130px_170px] border-b border-border bg-surface px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted md:grid">
          <span>{isHe ? "קמפיין" : "Campaign"}</span>
          <span>{isHe ? "סטטוס" : "Status"}</span>
          <span>{isHe ? "גיוס" : "Raised"}</span>
          <span className="text-end">{isHe ? "פעולות" : "Actions"}</span>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <h2 className="text-base font-bold text-foreground">
              {isHe ? "לא נמצאו קמפיינים" : "No campaigns found"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {isHe
                ? "נסה לשנות חיפוש או סינון."
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredCampaigns.map((campaign) => {
              const isActive = campaign.isActive !== false;
              const isRowPending = pendingId === campaign.id;
              const pct = Math.min(
                100,
                Math.round((campaign.raisedAmount / campaign.goalAmount) * 100)
              );

              return (
                <li
                  key={campaign.id}
                  data-campaign-id={campaign.id}
                  data-campaign-slug={campaign.slug}
                  className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(220px,1fr)_130px_130px_170px] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 h-10 w-10 shrink-0 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${campaign.gradientFrom}, ${campaign.gradientTo})`,
                        }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <a
                          href={`/${locale}/${campaign.slug}`}
                          className="block truncate text-sm font-bold text-foreground hover:text-primary-600"
                        >
                          {campaign.title}
                        </a>
                        <p className="mt-0.5 truncate text-xs text-muted">
                          /{campaign.slug} · {campaign.creatorName}
                        </p>
                        {!isActive && campaign.disabledAt && (
                          <p className="mt-1 text-xs text-warning-500">
                            {isHe ? "הושבת ב-" : "Disabled "}
                            {formatDate(campaign.disabledAt, locale)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        isActive
                          ? "bg-success-500/10 text-success-600"
                          : "bg-warning-500/10 text-warning-500"
                      }`}
                    >
                      {isActive
                        ? isHe
                          ? "פעיל"
                          : "Active"
                        : isHe
                          ? "מושבת"
                          : "Disabled"}
                    </span>
                  </div>

                  <div className="text-sm">
                    <div className="font-bold text-foreground" dir="ltr">
                      {formatNIS(campaign.raisedAmount)}
                    </div>
                    <div className="text-xs text-muted" dir="ltr">
                      {pct}% / {formatNIS(campaign.goalAmount)}
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                    <button
                      type="button"
                      disabled={isRowPending}
                      onClick={() =>
                        runAction(
                          campaign,
                          isActive ? "disable" : "activate",
                          !isActive
                        )
                      }
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        isActive
                          ? "bg-warning-500/10 text-warning-500 hover:bg-warning-500/15"
                          : "bg-success-500/10 text-success-600 hover:bg-success-500/15"
                      }`}
                    >
                      <span aria-hidden="true">{isActive ? "||" : ">"}</span>
                      {isActive
                        ? isHe
                          ? "השבת"
                          : "Disable"
                        : isHe
                          ? "הפעל"
                          : "Activate"}
                    </button>
                    <button
                      type="button"
                      disabled={isRowPending}
                      onClick={() => runAction(campaign, "delete")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-error-500/10 px-3 py-2 text-xs font-bold text-error-600 transition-colors hover:bg-error-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span aria-hidden="true">x</span>
                      {isHe ? "מחק" : "Delete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
