"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import type { MockCampaign } from "@/lib/mock-campaigns";
import { CATEGORIES, type CampaignCategory } from "@/lib/campaign-schema";
import { CATEGORY_HE_LABELS, CATEGORY_EN_LABELS } from "@/lib/category-gradients";

function formatNIS(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface ExploreGridProps {
  campaigns: MockCampaign[];
  locale: string;
}

export function ExploreGrid({ campaigns, locale }: ExploreGridProps) {
  const isHe = locale === "he";
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CampaignCategory | "all">("all");

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      // Category filter — campaign.category is stored as a Hebrew display string
      if (activeCategory !== "all") {
        const heLabel = CATEGORY_HE_LABELS[activeCategory];
        if (c.category !== heLabel) return false;
      }

      // Search filter — match title (Hebrew or English) and short description
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const titleMatch = c.title.toLowerCase().includes(q);
        const titleEnMatch = c.titleEn?.toLowerCase().includes(q) ?? false;
        const descMatch = c.shortDescription?.toLowerCase().includes(q) ?? false;
        if (!titleMatch && !titleEnMatch && !descMatch) return false;
      }

      return true;
    });
  }, [campaigns, activeCategory, search]);

  return (
    <>
      {/* ── Search + Filter bar ── */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isHe ? "חפש קמפיין..." : "Search campaigns..."}
            className="w-full rounded-xl border border-border bg-card py-3 ps-11 pe-4 text-base text-foreground placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeCategory === "all"
                ? "bg-primary-600 text-white"
                : "border border-border bg-card text-muted hover:border-primary-300 hover:text-foreground"
            }`}
          >
            {isHe ? "הכל" : "All"}
          </button>
          {CATEGORIES.map((cat) => {
            const label = isHe ? CATEGORY_HE_LABELS[cat] : CATEGORY_EN_LABELS[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activeCategory === cat
                    ? "bg-primary-600 text-white"
                    : "border border-border bg-card text-muted hover:border-primary-300 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="mb-6 text-sm text-muted">
        {isHe
          ? `${filtered.length} קמפיינים`
          : `${filtered.length} campaign${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {/* ── Campaign grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 text-5xl">🔍</div>
          <h3 className="text-lg font-bold text-foreground">
            {isHe ? "לא נמצאו קמפיינים" : "No campaigns found"}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {isHe
              ? "נסה לחפש במילים אחרות או לבחור קטגוריה אחרת"
              : "Try different keywords or select another category"}
          </p>
          {search && (
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              {isHe ? "נקה חיפוש" : "Clear search"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const pct = Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100));
            const title = !isHe && c.titleEn ? c.titleEn : c.title;
            return (
              <Link
                key={c.id}
                href={`/${c.slug}` as `/${string}`}
                className="card-hover group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                {/* Hero */}
                <div
                  className="relative h-44"
                  style={{
                    background: c.heroImageDataUrl
                      ? undefined
                      : `linear-gradient(135deg, ${c.gradientFrom} 0%, ${c.gradientTo} 100%)`,
                  }}
                >
                  {c.heroImageDataUrl ? (
                    <img
                      src={c.heroImageDataUrl}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/20" />
                  {c.endsInDays !== undefined && c.endsInDays <= 7 && (
                    <div className="absolute end-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-error-600">
                      {isHe ? `${c.endsInDays} ימים נותרו!` : `${c.endsInDays} days left!`}
                    </div>
                  )}
                  <div className="absolute bottom-3 start-4">
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {c.category}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="line-clamp-2 font-bold leading-snug text-foreground">
                    {title}
                  </h3>
                  {c.shortDescription && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {c.shortDescription}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-bold text-primary-600" dir="ltr">
                        {formatNIS(c.raisedAmount)}
                      </span>
                      <span className="font-semibold text-foreground" dir="ltr">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-primary-100">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1.5 text-xs text-muted" dir="ltr">
                      {isHe
                        ? `מתוך ${formatNIS(c.goalAmount)}`
                        : `of ${formatNIS(c.goalAmount)}`}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted">
                      <span className="font-semibold text-foreground" dir="ltr">
                        {c.donorCount.toLocaleString()}
                      </span>{" "}
                      {isHe ? "תורמים" : "donors"}
                    </div>
                    <span className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-bold text-white transition-colors group-hover:bg-primary-700">
                      {isHe ? "תרום" : "Donate"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
