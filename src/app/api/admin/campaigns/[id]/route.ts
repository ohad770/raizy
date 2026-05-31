import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteCampaign, setCampaignActive } from "@/lib/campaign-store";
import { routing } from "@/i18n/routing";

const updateCampaignStatusSchema = z.object({
  isActive: z.boolean(),
});

function revalidateCampaignViews() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/explore`);
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/[slug]`, "page");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = updateCampaignStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const updated = await setCampaignActive(id, parsed.data.isActive);
  if (!updated) {
    return NextResponse.json({ error: "campaign_not_found" }, { status: 404 });
  }

  revalidateCampaignViews();
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteCampaign(id);

  if (!deleted) {
    return NextResponse.json({ error: "campaign_not_found" }, { status: 404 });
  }

  revalidateCampaignViews();
  return NextResponse.json({ ok: true });
}
