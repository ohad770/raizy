const HEBREW_MAP: Record<string, string> = {
  א: "a", ב: "v", ג: "g", ד: "d", ה: "h", ו: "v", ז: "z",
  ח: "ch", ט: "t", י: "y", כ: "k", ך: "k", ל: "l", מ: "m",
  ם: "m", נ: "n", ן: "n", ס: "s", ע: "a", פ: "p", ף: "p",
  צ: "tz", ץ: "tz", ק: "k", ר: "r", ש: "sh", ת: "t",
};

export function hebrewToSlug(text: string): string {
  const latin = text
    .split("")
    .map((ch) => HEBREW_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  if (latin.length < 3) {
    return `campaign-${Date.now().toString(36).slice(-6)}`;
  }

  return latin;
}
