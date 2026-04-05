import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mockCampaigns } from "@/lib/mock-campaigns";

function formatNIS(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function HomePage({

  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePageContent locale={locale} />;
}

function HomePageContent({ locale }: { locale: string }) {
  const t = useTranslations();
  const isHe = locale === "he";

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="hero-gradient relative pb-20 pt-16 sm:pb-28 sm:pt-24">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -start-8 top-24 h-64 w-64 rounded-full bg-primary-200/30 blur-3xl" />
          <div className="animate-float-delayed absolute -end-8 top-40 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
            <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            {isHe ? "הפלטפורמה הישראלית לגיוס כספים" : "The Israeli Crowdfunding Platform"}
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {isHe ? (
              <>
                גייס כסף{" "}
                <span className="gradient-text">לכל מטרה</span>
              </>
            ) : (
              <>
                Fundraise for{" "}
                <span className="gradient-text">any cause</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {isHe
              ? "פשוט כמו וואטסאפ. אמין כמו בנק. שתף קמפיין ותן לקהילה לעשות את השאר."
              : "Simple as WhatsApp. Trusted as a bank. Share a campaign and let the community do the rest."}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/create"
              className="group inline-flex min-w-[200px] items-center justify-center rounded-xl bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
            >
              {isHe ? "✨ צור קמפיין בחינם" : "✨ Start a Free Campaign"}
            </Link>
            <Link
              href="/explore"
              className="inline-flex min-w-[200px] items-center justify-center rounded-xl border border-border bg-white px-8 py-4 text-base font-semibold text-foreground shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50"
            >
              {isHe ? "גלה קמפיינים →" : "Explore Campaigns →"}
            </Link>
          </div>

          {/* Social proof mini-bar */}
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔒</span>
              {isHe ? "תשלום מאובטח" : "Secure payment"}
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-base">⚡</span>
              {isHe ? "פתוח תוך דקות" : "Live in minutes"}
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-base">💚</span>
              {isHe ? "ללא עלות פתיחה" : "Free to start"}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-border bg-surface py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-3 divide-x divide-border rtl:divide-x-reverse">
            {[
              { value: "₪4.2M", labelHe: "גויסו עד היום", labelEn: "Raised to date" },
              { value: "1,240", labelHe: "קמפיינים פעילים", labelEn: "Active campaigns" },
              { value: "18K+", labelHe: "תורמים בפלטפורמה", labelEn: "Donors on platform" },
            ].map((stat) => (
              <div key={stat.value} className="px-4 text-center first:ps-0 last:pe-0 sm:px-8">
                <div className="text-2xl font-extrabold text-primary-600 sm:text-3xl ltr-nums">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {isHe ? stat.labelHe : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CAMPAIGNS ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600">
                {isHe ? "מומלצים" : "Featured"}
              </div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                {isHe ? "קמפיינים פעילים" : "Active Campaigns"}
              </h2>
            </div>
            <Link
              href="/explore"
              className="hidden text-sm font-semibold text-primary-600 hover:text-primary-700 sm:block"
            >
              {isHe ? "כל הקמפיינים ←" : "All campaigns →"}
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockCampaigns.map((c) => {
              const pct = Math.round((c.raisedAmount / c.goalAmount) * 100);
              const title = !isHe && c.titleEn ? c.titleEn : c.title;
              return (
                <Link
                  key={c.id}
                  href={`/${c.slug}` as `/${string}`}
                  className="card-hover group overflow-hidden rounded-2xl border border-border bg-card shadow-sm block"
                >
                  {/* Campaign hero gradient */}
                  <div
                    className="relative h-44"
                    style={{
                      background: `linear-gradient(135deg, ${c.gradientFrom} 0%, ${c.gradientTo} 100%)`,
                    }}
                  >
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

                  <div className="p-5">
                    <h3 className="line-clamp-2 font-bold text-foreground leading-snug">
                      {title}
                    </h3>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-bold text-primary-600" dir="ltr">
                          {formatNIS(c.raisedAmount)}
                        </span>
                        <span className="font-semibold text-foreground" dir="ltr">{pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-primary-100">
                        <div
                          className="animate-progress h-full rounded-full bg-primary-500"
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
                        <span className="font-semibold text-foreground" dir="ltr">{c.donorCount.toLocaleString()}</span>{" "}
                        {isHe ? "תורמים" : "donors"}
                      </div>
                      <span className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-bold text-white group-hover:bg-primary-700 transition-colors">
                        {isHe ? "תרום" : "Donate"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/explore"
              className="text-sm font-semibold text-primary-600"
            >
              {isHe ? "לכל הקמפיינים →" : "View all campaigns →"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-14 text-center">
            <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600">
              {isHe ? "פשוט להתחיל" : "Simple to start"}
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              {t("home.howItWorks.title")}
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: 1,
                icon: "📝",
                titleHe: "צור קמפיין",
                titleEn: "Create a Campaign",
                descHe: "ספר את הסיפור שלך, הגדר יעד, הוסף תמונה. לוקח 5 דקות.",
                descEn: "Tell your story, set a goal, add a photo. Takes 5 minutes.",
              },
              {
                step: 2,
                icon: "📱",
                titleHe: "שתף בוואטסאפ",
                titleEn: "Share on WhatsApp",
                descHe: "שלח קישור לחברים ולמשפחה. הם רואים עמוד יפה עם פס התקדמות.",
                descEn: "Send a link to friends and family. They see a beautiful page with a progress bar.",
              },
              {
                step: 3,
                icon: "💰",
                titleHe: "קבל תרומות",
                titleEn: "Receive Donations",
                descHe: "כסף מועבר ישירות לחשבונך. ממש כמו העברה בנקאית, אבל עם רוח.",
                descEn: "Money transferred directly to your account. Just like a bank transfer, but with heart.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line (desktop only) */}
                {item.step < 3 && (
                  <div className="absolute start-1/2 top-8 hidden h-0.5 w-full bg-primary-100 sm:block" />
                )}
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md shadow-primary-100 border border-primary-100">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {isHe ? item.titleHe : item.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {isHe ? item.descHe : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🔐", titleHe: "תשלום מאובטח", descHe: "כרטיסי אשראי מוצפנים דרך Cardcom", titleEn: "Secure Payment", descEn: "Credit cards encrypted via Cardcom" },
              { icon: "✅", titleHe: "קמפיינים מאומתים", descHe: "כל קמפיין עובר בדיקה ידנית", titleEn: "Verified Campaigns", descEn: "Every campaign is manually reviewed" },
              { icon: "💬", titleHe: "תמיכה בעברית", descHe: "צוות תמיכה ישראלי זמין בוואטסאפ", titleEn: "Hebrew Support", descEn: "Israeli support team available on WhatsApp" },
              { icon: "📊", titleHe: "שקיפות מלאה", descHe: "כל תרומה גלויה לציבור. אין הפתעות.", titleEn: "Full Transparency", descEn: "Every donation is publicly visible. No surprises." },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h3 className="font-bold text-foreground">
                  {isHe ? item.titleHe : item.titleEn}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {isHe ? item.descHe : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative overflow-hidden bg-primary-600 py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -start-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -end-8 h-48 w-48 rounded-full bg-white/5" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            {isHe ? "מוכן להתחיל לגייס?" : "Ready to start fundraising?"}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-primary-200">
            {isHe
              ? "הצטרף ל-18,000 ישראלים שכבר גייסו מיליונים דרך Raizy."
              : "Join 18,000 Israelis who have already raised millions through Raizy."}
          </p>
          <Link
            href="/create"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-10 py-4 text-base font-bold text-primary-700 shadow-lg transition-all hover:bg-primary-50 hover:-translate-y-0.5"
          >
            {isHe ? "✨ פתח קמפיין עכשיו — בחינם" : "✨ Open a campaign now — Free"}
          </Link>
        </div>
      </section>
    </div>
  );
}
