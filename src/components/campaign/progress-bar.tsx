"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ProgressBarProps {
  raisedAmount: number; // NIS
  goalAmount: number; // NIS
  donorCount: number;
}

export function ProgressBar({
  raisedAmount,
  goalAmount,
  donorCount,
}: ProgressBarProps) {
  const t = useTranslations("campaign");
  const percentage = Math.min(
    Math.round((raisedAmount / goalAmount) * 100),
    100
  );
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setWidth(percentage), 120);
    return () => clearTimeout(id);
  }, [percentage]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const isGoalReached = percentage >= 100;

  return (
    <div className="w-full">
      {/* Bar track */}
      <div className="relative h-3 rounded-full bg-surface overflow-hidden">
        <div
          className="absolute inset-y-0 start-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: isGoalReached
              ? "var(--color-success-500)"
              : "var(--color-primary-600)",
          }}
        />
      </div>

      {/* Numbers */}
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <span
            className="text-2xl font-bold text-foreground"
            dir="ltr"
          >
            {fmt(raisedAmount)}
          </span>
          <span className="ms-1.5 text-sm text-muted">
            {t("of")} {fmt(goalAmount)}
          </span>
        </div>
        <span
          className="text-lg font-bold flex-shrink-0"
          dir="ltr"
          style={{
            color: isGoalReached
              ? "var(--color-success-500)"
              : "var(--color-primary-600)",
          }}
        >
          {percentage}%
        </span>
      </div>

      {/* Donor count */}
      <p className="mt-1 text-sm text-muted">
        <span className="font-semibold text-foreground" dir="ltr">
          {donorCount.toLocaleString("he-IL")}
        </span>{" "}
        {t("donors")}
        {isGoalReached && (
          <span className="ms-2 text-xs font-semibold text-success-500">
            · {t("goalReached")}
          </span>
        )}
      </p>
    </div>
  );
}
