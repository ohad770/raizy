import { NextRequest, NextResponse } from "next/server";
import { createCampaignSchema } from "@/lib/campaign-schema";
import { addCampaign, isSlugTaken } from "@/lib/campaign-store";
import { CATEGORY_GRADIENTS, CATEGORY_HE_LABELS } from "@/lib/category-gradients";
import type { MockCampaign } from "@/lib/mock-campaigns";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = createCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;

  if (await isSlugTaken(data.slug)) {
    return NextResponse.json({ error: "slug_taken" }, { status: 409 });
  }

  const gradient = CATEGORY_GRADIENTS[data.category];

  const newCampaign: MockCampaign = {
    id: crypto.randomUUID(),
    slug: data.slug,
    title: data.title,
    shortDescription: data.shortDescription ?? "",
    story: data.story,
    category: CATEGORY_HE_LABELS[data.category],
    goalAmount: data.goalAmount,
    raisedAmount: 0,
    donorCount: 0,
    creatorName: data.creatorName || "אנונימי",
    createdDaysAgo: 0,
    gradientFrom: gradient.from,
    gradientTo: gradient.to,
    heroImageDataUrl: data.heroImageDataUrl || undefined,
    recentDonations: [],
  };

  await addCampaign(newCampaign);

  return NextResponse.json({ slug: data.slug }, { status: 201 });
}
