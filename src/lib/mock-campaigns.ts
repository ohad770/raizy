export interface RecentDonation {
  id: string;
  displayName: string;
  amount: number; // NIS
  message?: string;
  createdAtMs: number; // Date.now() timestamp
  isAnonymous: boolean;
}

export interface MockCampaign {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  shortDescription: string;
  story: string;
  category: string;
  goalAmount: number; // NIS
  raisedAmount: number; // NIS
  donorCount: number;
  creatorName: string;
  createdDaysAgo: number;
  endsInDays?: number;
  gradientFrom: string; // hex
  gradientTo: string; // hex
  recentDonations: RecentDonation[];
}

const NOW = 1744000000000; // fixed reference so server/client agree

export const mockCampaigns: MockCampaign[] = [
  {
    id: "1",
    slug: "save-the-shelter",
    title: "הצלת מקלט הכלבים בתל אביב",
    titleEn: "Save the Tel Aviv Dog Shelter",
    shortDescription:
      "מקלט הכלבים שלנו זקוק לעזרתכם! 237 כלבים ממתינים לבית חדש ולסיכוי חדש.",
    story: `מקלט הכלבים של תל אביב פועל כבר 15 שנה ומטפל במאות כלבים בכל שנה.

לאחרונה קיבלנו הודעה שצריכים לפנות את המבנה תוך 90 יום. אנחנו מחפשים מקום חדש ונדרשים לסכום של 30,000 ₪ לשיפוצים, רישיונות ועלויות העברה.

כל אחד מהכלבים שלנו זכאי לבית חמים ולאהבה. בעזרתכם נוכל להמשיך את העבודה החשובה הזו ולמצוא לכולם את הבית שהם מגיעים לו.

תודה מכל הלב על כל תמיכה, קטנה כגדולה.`,
    category: "קהילה",
    goalAmount: 30000,
    raisedAmount: 18400,
    donorCount: 237,
    creatorName: "יוסי כהן",
    createdDaysAgo: 5,
    endsInDays: 25,
    gradientFrom: "#fb923c",
    gradientTo: "#ea580c",
    recentDonations: [
      {
        id: "d1",
        displayName: "רחל לוי",
        amount: 180,
        message: "בהצלחה! ❤️",
        createdAtMs: NOW - 1000 * 60 * 3,
        isAnonymous: false,
      },
      {
        id: "d2",
        displayName: "תורם אנונימי",
        amount: 100,
        createdAtMs: NOW - 1000 * 60 * 15,
        isAnonymous: true,
      },
      {
        id: "d3",
        displayName: "משה ישראלי",
        amount: 360,
        message: "כל הכבוד! שתהיה בהצלחה רבה",
        createdAtMs: NOW - 1000 * 60 * 47,
        isAnonymous: false,
      },
      {
        id: "d4",
        displayName: "דנה מזרחי",
        amount: 50,
        createdAtMs: NOW - 1000 * 60 * 90,
        isAnonymous: false,
      },
      {
        id: "d5",
        displayName: "אבי שפירא",
        amount: 200,
        message: "תמשיכו בעבודה הנפלאה!",
        createdAtMs: NOW - 1000 * 60 * 140,
        isAnonymous: false,
      },
    ],
  },
  {
    id: "2",
    slug: "noam-medical",
    title: "עזרו לנועם — טיפול רפואי דחוף",
    titleEn: "Help Noam — Urgent Medical Treatment",
    shortDescription:
      "נועם בן 8 זקוק לניתוח שאינו מכוסה בסל הבריאות. נסייע לו לחזור לשגרה.",
    story: `נועם, בן שמונה מרעננה, אובחן עם מצב רפואי נדיר שדורש ניתוח מיוחד במרכז רפואי מוביל.

הניתוח אינו מכוסה על ידי קופת החולים ועלותו 45,000 ₪. המשפחה מיצתה את כל חסכונותיה ונדרשת לעזרת הקהילה כדי לממן את הטיפול.

הניתוח תוכנן לחודש הבא — כל שקל שנגייס יקרב אותנו לתת לנועם את הסיכוי שמגיע לו לחזור לחיים רגילים, לבית הספר ולחברים שלו.

רפואה שלמה לנועם.`,
    category: "רפואי",
    goalAmount: 45000,
    raisedAmount: 28750,
    donorCount: 412,
    creatorName: "שרה אברהם",
    createdDaysAgo: 12,
    endsInDays: 18,
    gradientFrom: "#60a5fa",
    gradientTo: "#4f46e5",
    recentDonations: [
      {
        id: "d1",
        displayName: "משפחת כהן",
        amount: 500,
        message: "רפואה שלמה לנועם! 💙",
        createdAtMs: NOW - 1000 * 60 * 5,
        isAnonymous: false,
      },
      {
        id: "d2",
        displayName: "תורמת אנונימית",
        amount: 180,
        createdAtMs: NOW - 1000 * 60 * 22,
        isAnonymous: true,
      },
      {
        id: "d3",
        displayName: "אורי בן דוד",
        amount: 100,
        message: "הולך עם לב שלם, תתחזקו",
        createdAtMs: NOW - 1000 * 60 * 35,
        isAnonymous: false,
      },
      {
        id: "d4",
        displayName: "ליאת ורון",
        amount: 360,
        createdAtMs: NOW - 1000 * 60 * 70,
        isAnonymous: false,
      },
    ],
  },
];

export function getCampaignBySlug(slug: string): MockCampaign | null {
  return mockCampaigns.find((c) => c.slug === slug) ?? null;
}

export function formatNIS(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTimeAgo(createdAtMs: number): string {
  const diffMin = Math.floor((NOW - createdAtMs) / (1000 * 60));
  if (diffMin < 1) return "הרגע";
  if (diffMin < 60) return `לפני ${diffMin} דקות`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  const diffDays = Math.floor(diffHours / 24);
  return `לפני ${diffDays} ימים`;
}
