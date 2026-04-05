"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

export interface DonationCampaignProps {
  id: string;
  slug: string;
  title: string;
  donorCount: number;
  raisedAmount: number;
  goalAmount: number;
}

interface DonationButtonProps {
  campaign: DonationCampaignProps;
  locale: string;
  campaignUrl: string;
}

type Step = "amount" | "info" | "processing" | "success";

const SUGGESTED_AMOUNTS = [50, 100, 180, 360];

export function DonationButton({
  campaign,
  locale,
  campaignUrl,
}: DonationButtonProps) {
  const t = useTranslations("donation");
  const tCampaign = useTranslations("campaign");
  const tCommon = useTranslations("common");

  // Sheet open/close animation state
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Form state
  const [step, setStep] = useState<Step>("amount");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmountStr, setCustomAmountStr] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveAmount = customAmountStr
    ? Math.max(0, parseInt(customAmountStr, 10) || 0)
    : selectedAmount ?? 0;

  const fmt = (n: number) =>
    new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  // Body scroll lock
  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  const openSheet = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMounted(true);
    // Two rAFs ensure the element is painted before we trigger the transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const resetForm = useCallback(() => {
    setStep("amount");
    setSelectedAmount(100);
    setCustomAmountStr("");
    setDisplayName("");
    setEmail("");
    setMessage("");
    setIsAnonymous(false);
  }, []);

  const closeSheet = useCallback(() => {
    setVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setMounted(false);
      resetForm();
    }, 300);
  }, [resetForm]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleAmountNext = () => {
    if (effectiveAmount < 10) return;
    setStep("info");
  };

  const handleInfoSubmit = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 2000);
  };

  const donorNumber = campaign.donorCount + 1;

  const whatsappText = encodeURIComponent(
    `תרמתי זה עתה ל${campaign.title} ❤️\nבואו נגיע ליעד ביחד! 🙏\n${campaignUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  const buttonLabel =
    step === "amount" || !visible
      ? `${tCampaign("donateButton")} — ${fmt(effectiveAmount || 100)}`
      : tCampaign("donateButton");

  return (
    <>
      {/* ── Sticky donate bar ── */}
      <div className="fixed bottom-0 start-0 end-0 z-40 border-t border-border bg-card/95 backdrop-blur px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={openSheet}
            className="w-full rounded-xl bg-primary-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-[0.98] transition-all duration-150"
          >
            {buttonLabel}
          </button>
        </div>
      </div>

      {/* ── Backdrop ── */}
      {mounted && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
          onClick={closeSheet}
          aria-hidden="true"
        />
      )}

      {/* ── Bottom sheet ── */}
      {mounted && (
        <div
          className="fixed bottom-0 start-0 end-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl bg-card shadow-2xl transition-transform duration-300 ease-out"
          style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
        >
          {/* Handle */}
          <div className="flex shrink-0 justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          {/* Sheet header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-lg font-bold text-foreground">
              {step === "success"
                ? t("success")
                : step === "processing"
                  ? t("processing").split("...")[0]
                  : t("title")}
            </h2>
            <button
              onClick={closeSheet}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-sm text-muted transition-colors hover:bg-border hover:text-foreground"
              aria-label={tCommon("close")}
            >
              ✕
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">

            {/* ── STEP: AMOUNT ── */}
            {step === "amount" && (
              <div className="space-y-5">
                <p className="text-sm font-medium text-muted line-clamp-1">
                  {campaign.title}
                </p>

                {/* Suggested amounts */}
                <div>
                  <p className="mb-3 text-sm font-medium text-foreground">
                    {t("selectAmount")}
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {SUGGESTED_AMOUNTS.map((amt) => {
                      const isSelected =
                        selectedAmount === amt && !customAmountStr;
                      return (
                        <button
                          key={amt}
                          onClick={() => {
                            setSelectedAmount(amt);
                            setCustomAmountStr("");
                          }}
                          className={`rounded-xl border-2 px-3 py-3.5 text-center transition-all ${
                            isSelected
                              ? "border-primary-600 bg-primary-50 text-primary-700"
                              : "border-border bg-surface text-foreground hover:border-primary-300"
                          }`}
                        >
                          <span
                            className="block text-base font-bold"
                            dir="ltr"
                          >
                            {fmt(amt)}
                          </span>
                          {(amt === 180 || amt === 360) && (
                            <span className="mt-0.5 block text-[10px] font-normal text-muted">
                              {amt / 18}× חי
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom amount */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t("customAmount")}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 font-medium text-muted">
                      ₪
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={customAmountStr}
                      onChange={(e) => {
                        setCustomAmountStr(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="0"
                      min="10"
                      max="10000"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 ps-9 text-foreground placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      dir="ltr"
                    />
                  </div>
                  {effectiveAmount > 0 && effectiveAmount < 10 && (
                    <p className="mt-1.5 text-xs text-error-500">
                      {t("minimumAmount")}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleAmountNext}
                  disabled={effectiveAmount < 10}
                  className="w-full rounded-xl bg-primary-600 py-4 text-base font-bold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("completeDonation")} —{" "}
                  <span dir="ltr">{fmt(effectiveAmount)}</span>
                </button>

                <p className="text-center text-xs text-muted">
                  {t("fullAmountGoes")}
                </p>
              </div>
            )}

            {/* ── STEP: INFO ── */}
            {step === "info" && (
              <div className="space-y-4">
                {/* Back */}
                <button
                  onClick={() => setStep("amount")}
                  className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
                >
                  <span aria-hidden>{locale === "he" ? "→" : "←"}</span>
                  {tCommon("back")}
                </button>

                {/* Amount badge */}
                <div className="flex items-center justify-between rounded-xl border border-primary-100 bg-primary-50 px-4 py-3">
                  <span className="text-sm font-medium text-primary-700">
                    {t("title")}
                  </span>
                  <span className="font-bold text-primary-700" dir="ltr">
                    {fmt(effectiveAmount)}
                  </span>
                </div>

                {/* Display name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t("displayName")}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("displayNamePlaceholder")}
                    disabled={isAnonymous}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    dir="ltr"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t("message")}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("messagePlaceholder")}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                {/* Anonymous toggle */}
                <label className="flex cursor-pointer items-center gap-3">
                  <div
                    dir="ltr"
                    role="switch"
                    aria-checked={isAnonymous}
                    tabIndex={0}
                    onClick={() => setIsAnonymous((v) => !v)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter")
                        setIsAnonymous((v) => !v);
                    }}
                    className={`relative h-6 w-10 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
                      isAnonymous ? "bg-primary-600" : "bg-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        isAnonymous ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("anonymous")}
                    </p>
                    <p className="text-xs text-muted">{t("anonymousHint")}</p>
                  </div>
                </label>

                <button
                  onClick={handleInfoSubmit}
                  className="w-full rounded-xl bg-primary-600 py-4 text-base font-bold text-white transition-colors hover:bg-primary-700"
                >
                  {t("completeDonation")} —{" "}
                  <span dir="ltr">{fmt(effectiveAmount)}</span>
                </button>
              </div>
            )}

            {/* ── STEP: PROCESSING ── */}
            {step === "processing" && (
              <div className="flex flex-col items-center justify-center py-16 gap-5">
                <div className="h-16 w-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">
                    {t("processing")}
                  </p>
                  <p className="mt-1 text-sm text-muted">{t("doNotClose")}</p>
                </div>
              </div>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === "success" && (
              <div className="flex flex-col items-center py-8 text-center gap-5">
                {/* Checkmark */}
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white"
                  style={{
                    background: "var(--color-success-500)",
                    boxShadow: "0 8px 32px -8px var(--color-success-500)",
                  }}
                >
                  ✓
                </div>

                {/* Message */}
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {t("success")}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">
                    {t("successMessage", {
                      amount: fmt(effectiveAmount),
                      campaign: campaign.title,
                    })}
                  </p>
                </div>

                {/* Donor badge */}
                <div className="rounded-xl border border-primary-100 bg-primary-50 px-6 py-3">
                  <p className="font-bold text-primary-700">
                    {t("donorNumber", { number: donorNumber })}
                  </p>
                </div>

                {/* Share */}
                <div className="w-full space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    {t("sharePrompt", { campaign: campaign.title })}
                  </p>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-base font-bold text-white transition-colors hover:opacity-90"
                    style={{ background: "#25D366" }}
                  >
                    {/* WhatsApp icon */}
                    <svg
                      className="h-5 w-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {locale === "he" ? "שתף בוואטסאפ" : "Share on WhatsApp"}
                  </a>

                  <button
                    onClick={closeSheet}
                    className="w-full rounded-xl border border-border py-3 text-sm font-medium text-muted transition-colors hover:border-muted hover:text-foreground"
                  >
                    {tCommon("close")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
