import { type CampaignCategory } from "./campaign-schema";

export const CATEGORY_GRADIENTS: Record<
  CampaignCategory,
  { from: string; to: string }
> = {
  medical:   { from: "#60a5fa", to: "#4f46e5" },
  education: { from: "#34d399", to: "#0891b2" },
  community: { from: "#fb923c", to: "#ea580c" },
  emergency: { from: "#f87171", to: "#dc2626" },
  personal:  { from: "#a78bfa", to: "#7c3aed" },
  business:  { from: "#6366f1", to: "#312e81" },
  other:     { from: "#94a3b8", to: "#475569" },
};

export const CATEGORY_HE_LABELS: Record<CampaignCategory, string> = {
  medical:   "רפואי",
  education: "חינוך",
  community: "קהילה",
  emergency: "חירום",
  personal:  "אישי",
  business:  "עסקי",
  other:     "אחר",
};

export const CATEGORY_EN_LABELS: Record<CampaignCategory, string> = {
  medical:   "Medical",
  education: "Education",
  community: "Community",
  emergency: "Emergency",
  personal:  "Personal",
  business:  "Business",
  other:     "Other",
};
