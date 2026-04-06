"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  createCampaignSchema,
  type CreateCampaignInput,
  type CreateCampaignFormValues,
  CATEGORIES,
} from "@/lib/campaign-schema";
import { hebrewToSlug } from "@/lib/slug-utils";
import {
  CATEGORY_GRADIENTS,
  CATEGORY_HE_LABELS,
  CATEGORY_EN_LABELS,
} from "@/lib/category-gradients";

interface CampaignFormProps {
  locale: string;
}

type SlugStatus = "idle" | "checking" | "available" | "taken";

// ── Section wrapper ──────────────────────────────────────────────────────────
function FormSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
        {label}
      </h2>
      {children}
    </section>
  );
}

// ── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  );
}

// ── Input class ──────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-base";

// ── Main form ────────────────────────────────────────────────────────────────
export function CampaignForm({ locale }: CampaignFormProps) {
  const t = useTranslations("create");
  const router = useRouter();
  const isHe = locale === "he";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignFormValues, unknown, CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      goalAmount: undefined,
      category: undefined,
      story: "",
      slug: "",
      creatorName: "",
      heroImageDataUrl: "",
    },
  });

  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleValue = watch("title");
  const slugValue = watch("slug");
  const storyValue = watch("story") ?? "";
  const shortDescValue = watch("shortDescription") ?? "";
  const categoryValue = watch("category");

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!titleValue || titleValue.length < 3) return;
    const generated = hebrewToSlug(titleValue);
    setValue("slug", generated, { shouldValidate: false });
    checkSlug(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleValue]);

  // Auto-scroll to first error
  useEffect(() => {
    const firstKey = Object.keys(errors)[0];
    if (firstKey) {
      const el = document.getElementById(firstKey);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errors]);

  const checkSlug = useCallback((slug: string) => {
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    if (!slug || slug.length < 3) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    slugCheckTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/campaigns/slug-check?slug=${encodeURIComponent(slug)}`
        );
        const { available } = await res.json();
        setSlugStatus(available ? "available" : "taken");
      } catch {
        setSlugStatus("idle");
      }
    }, 500);
  }, []);

  function handleSlugBlur() {
    if (slugValue) checkSlug(slugValue);
  }

  function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setHeroError(t("heroImageTooBig"));
      return;
    }

    setHeroError(null);

    // Revoke old URL
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setHeroPreviewUrl(url);
    setHeroFile(file);
  }

  function removeHeroImage() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setHeroPreviewUrl(null);
    setHeroFile(null);
    setValue("heroImageDataUrl", "");
  }

  async function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onSubmit(data: CreateCampaignInput) {
    // Guard slug
    if (slugStatus === "taken") {
      setError("slug", { message: t("slugTaken") });
      return;
    }

    // Hero image required
    if (!heroFile) {
      setHeroError(t("heroImageRequired"));
      document
        .getElementById("heroImage")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Convert hero to base64
    let heroImageDataUrl = "";
    try {
      heroImageDataUrl = await readFileAsDataUrl(heroFile);
    } catch {
      setHeroError("שגיאה בטעינת התמונה. נסה שוב.");
      return;
    }

    const payload: CreateCampaignInput = { ...data, heroImageDataUrl };

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      setError("slug", { message: t("slugTaken") });
      return;
    }

    if (!res.ok) {
      setError("root", { message: "אירעה שגיאה. נסה שוב." });
      return;
    }

    const { slug } = await res.json();
    router.push(
      { pathname: `/${slug}` as `/${string}`, query: { created: "1" } },
    );
  }

  // Current gradient for preview
  const gradient = categoryValue
    ? CATEGORY_GRADIENTS[categoryValue]
    : { from: "#cbd5e1", to: "#94a3b8" };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* ── BASIC INFO ─────────────────────────────────────────────────── */}
      <FormSection label={isHe ? "פרטים בסיסיים" : "Basic Info"}>
        {/* Title */}
        <Field
          label={t("campaignTitle")}
          error={errors.title?.message}
        >
          <input
            id="title"
            type="text"
            placeholder={t("campaignTitlePlaceholder")}
            className={inputCls}
            {...register("title")}
          />
        </Field>

        {/* Slug */}
        <Field
          label={t("slugLabel")}
          error={errors.slug?.message}
          hint={`raizy.co/${locale}/`}
        >
          <div className="relative">
            <input
              id="slug"
              type="text"
              className={`${inputCls} pe-28`}
              dir="ltr"
              {...register("slug")}
              onBlur={handleSlugBlur}
            />
            {/* Status badge */}
            {slugStatus !== "idle" && (
              <span
                className={`absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-full ${
                  slugStatus === "available"
                    ? "bg-success-500/10 text-success-600"
                    : slugStatus === "taken"
                      ? "bg-error-500/10 text-error-500"
                      : "bg-surface text-muted"
                }`}
              >
                {slugStatus === "available"
                  ? t("slugAvailable")
                  : slugStatus === "taken"
                    ? t("slugTaken")
                    : t("slugChecking")}
              </span>
            )}
          </div>
        </Field>

        {/* Category */}
        <Field label={t("category")} error={errors.category?.message}>
          <select
            id="category"
            className={`${inputCls} appearance-none`}
            {...register("category")}
          >
            <option value="">{t("selectCategory")}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {isHe ? CATEGORY_HE_LABELS[cat] : CATEGORY_EN_LABELS[cat]}
              </option>
            ))}
          </select>
        </Field>

        {/* Short description */}
        <Field
          label={t("shortDescription")}
          error={errors.shortDescription?.message}
          hint={t("shortDescriptionHint")}
        >
          <div className="relative">
            <input
              id="shortDescription"
              type="text"
              maxLength={160}
              className={`${inputCls} pe-12`}
              placeholder={isHe ? "תיאור קצר שיופיע בשיתוף בוואטסאפ" : "Short description for WhatsApp sharing"}
              {...register("shortDescription")}
            />
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-light">
              {shortDescValue.length}/160
            </span>
          </div>
        </Field>
      </FormSection>

      {/* ── GOAL ───────────────────────────────────────────────────────── */}
      <FormSection label={isHe ? "יעד גיוס" : "Fundraising Goal"}>
        <Field
          label={t("goalAmount")}
          error={errors.goalAmount?.message}
          hint={t("goalAmountHint")}
        >
          <div className="relative">
            <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 font-semibold text-muted">
              ₪
            </span>
            <input
              id="goalAmount"
              type="number"
              inputMode="numeric"
              min={100}
              className={`${inputCls} ps-9`}
              placeholder="10,000"
              dir="ltr"
              {...register("goalAmount")}
            />
          </div>
        </Field>
      </FormSection>

      {/* ── HERO IMAGE ─────────────────────────────────────────────────── */}
      <FormSection label={isHe ? "תמונה ראשית" : "Hero Image"}>
        <div id="heroImage">
          {/* Preview */}
          {heroPreviewUrl ? (
            <div className="relative overflow-hidden rounded-xl">
              {/* Aspect ratio 1200x630 ≈ 16:8.4 */}
              <div className="aspect-[1200/630] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroPreviewUrl}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeHeroImage}
                className="absolute end-2 top-2 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 transition-colors"
              >
                {t("removeImage")}
              </button>
            </div>
          ) : (
            /* Upload zone */
            <label
              className="flex aspect-[1200/630] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface transition-colors hover:border-primary-400 hover:bg-primary-50"
              style={{
                background: `linear-gradient(135deg, ${gradient.from}15 0%, ${gradient.to}15 100%)`,
                borderColor: gradient.from + "60",
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: `${gradient.from}25` }}
              >
                <svg
                  className="h-7 w-7"
                  style={{ color: gradient.from }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18v-1.5M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {t("chooseImage")}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {t("heroImageHint")}
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleHeroChange}
              />
            </label>
          )}
          {heroError && (
            <p className="mt-1.5 text-xs text-error-500">{heroError}</p>
          )}
        </div>
      </FormSection>

      {/* ── STORY ──────────────────────────────────────────────────────── */}
      <FormSection label={isHe ? "הסיפור שלך" : "Your Story"}>
        <Field
          label={t("story")}
          error={errors.story?.message}
          hint={t("storyHint")}
        >
          <div className="relative">
            <textarea
              id="story"
              rows={8}
              className={`${inputCls} min-h-[200px] resize-y`}
              placeholder={t("storyPlaceholder")}
              {...register("story")}
            />
            <span className="absolute bottom-3 end-3 text-xs text-muted-light">
              {storyValue.length}
            </span>
          </div>
        </Field>
      </FormSection>

      {/* ── OPTIONAL ───────────────────────────────────────────────────── */}
      <FormSection label={isHe ? "פרטים נוספים" : "Additional Details"}>
        <Field
          label={t("creatorName")}
          error={errors.creatorName?.message}
        >
          <input
            id="creatorName"
            type="text"
            placeholder={t("creatorNamePlaceholder")}
            className={inputCls}
            {...register("creatorName")}
          />
        </Field>
      </FormSection>

      {/* ── ROOT ERROR ─────────────────────────────────────────────────── */}
      {errors.root && (
        <p className="rounded-xl bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {errors.root.message}
        </p>
      )}

      {/* ── SUBMIT ─────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary-600 py-4 text-base font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t("submitting") : t("publish")}
      </button>

      <p className="pb-4 text-center text-xs text-muted">
        {isHe
          ? "על ידי פרסום, אתה מסכים לתנאי השימוש ומדיניות הפרטיות שלנו."
          : "By publishing, you agree to our Terms of Service and Privacy Policy."}
      </p>
    </form>
  );
}
