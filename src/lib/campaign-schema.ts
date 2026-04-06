import { z } from "zod";

export const CATEGORIES = [
  "medical",
  "education",
  "community",
  "emergency",
  "personal",
  "business",
  "other",
] as const;

export type CampaignCategory = (typeof CATEGORIES)[number];

export const createCampaignSchema = z.object({
  title: z
    .string()
    .min(5, "כותרת חייבת להיות לפחות 5 תווים")
    .max(80, "כותרת ארוכה מדי (מקסימום 80 תווים)"),
  shortDescription: z
    .string()
    .max(160, "תיאור קצר לא יכול לעלות על 160 תווים")
    .optional()
    .or(z.literal("")),
  goalAmount: z.coerce
    .number()
    .int()
    .min(100, "יעד מינימלי הוא ₪100")
    .max(10_000_000, "יעד מקסימלי הוא ₪10,000,000"),
  category: z.enum(CATEGORIES),
  story: z
    .string()
    .min(20, "הסיפור חייב להיות לפחות 20 תווים")
    .max(10_000, "הסיפור ארוך מדי"),
  slug: z
    .string()
    .min(3, "כתובת URL קצרה מדי")
    .max(60, "כתובת URL ארוכה מדי")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "כתובת URL יכולה להכיל רק אותיות לטיניות קטנות, מספרים ומקפים"
    ),
  creatorName: z.string().max(50).optional().or(z.literal("")),
  heroImageDataUrl: z.string().optional().or(z.literal("")),
});

// Output type (after coercion/transformation) — used by submit handler
export type CreateCampaignInput = z.output<typeof createCampaignSchema>;
// Input type (raw form values before coercion) — used by useForm
export type CreateCampaignFormValues = z.input<typeof createCampaignSchema>;
