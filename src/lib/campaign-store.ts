/**
 * Campaign store
 *
 * Priority:  Supabase (real persistence) → globalThis (in-process fallback)
 *
 * When NEXT_PUBLIC_SUPABASE_URL + a Supabase key are present every write
 * goes to the `mvp_campaigns` table and every read comes from there.
 * When the env vars are absent (local dev without .env.local) we fall
 * back to a globalThis store that at least survives within the same
 * Node.js process (all Next.js module-graph contexts share it).
 */

import { mockCampaigns, type MockCampaign } from "./mock-campaigns";
import { getSupabaseServer } from "./supabase-server";

// ─── DB row shape ──────────────────────────────────────────────────────────

interface DbRow {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  story: string;
  category: string;
  goal_amount: number;
  raised_amount: number;
  donor_count: number;
  creator_name: string;
  gradient_from: string;
  gradient_to: string;
  hero_image_data_url: string | null;
  created_at: string;
}

function rowToCampaign(row: DbRow): MockCampaign {
  const daysSince = Math.floor(
    (Date.now() - new Date(row.created_at).getTime()) / 86_400_000
  );
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description ?? "",
    story: row.story,
    category: row.category,
    goalAmount: row.goal_amount,
    raisedAmount: row.raised_amount,
    donorCount: row.donor_count,
    creatorName: row.creator_name,
    createdDaysAgo: daysSince,
    gradientFrom: row.gradient_from,
    gradientTo: row.gradient_to,
    heroImageDataUrl: row.hero_image_data_url ?? undefined,
    recentDonations: [],
  };
}

// ─── GlobalThis fallback ───────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __raizy_campaign_store: MockCampaign[] | undefined;
}

function memStore(): MockCampaign[] {
  if (!globalThis.__raizy_campaign_store) {
    globalThis.__raizy_campaign_store = [...mockCampaigns];
  }
  return globalThis.__raizy_campaign_store;
}

// ─── Public async API ──────────────────────────────────────────────────────

export async function getAllCampaigns(): Promise<MockCampaign[]> {
  const sb = getSupabaseServer();
  if (sb) {
    const { data, error } = await sb
      .from("mvp_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const dbCampaigns = (data as DbRow[]).map(rowToCampaign);
      // Merge: DB campaigns first, then any mock campaigns not in the DB
      const dbSlugs = new Set(dbCampaigns.map((c) => c.slug));
      const extras = mockCampaigns.filter((m) => !dbSlugs.has(m.slug));
      return [...dbCampaigns, ...extras];
    }
    console.error("[campaign-store] getAllCampaigns Supabase error:", error);
  }

  return memStore();
}

export async function getCampaignBySlugFromStore(
  slug: string
): Promise<MockCampaign | null> {
  const sb = getSupabaseServer();
  if (sb) {
    const { data, error } = await sb
      .from("mvp_campaigns")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) return rowToCampaign(data as DbRow);
    if (error) console.error("[campaign-store] getCampaignBySlug error:", error);
  }

  return memStore().find((c) => c.slug === slug) ?? null;
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  const sb = getSupabaseServer();
  if (sb) {
    const { data, error } = await sb
      .from("mvp_campaigns")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (!error) return data !== null;
    console.error("[campaign-store] isSlugTaken error:", error);
  }

  return memStore().some((c) => c.slug === slug);
}

export async function addCampaign(campaign: MockCampaign): Promise<void> {
  const sb = getSupabaseServer();
  if (sb) {
    const { error } = await sb.from("mvp_campaigns").insert({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      short_description: campaign.shortDescription || null,
      story: campaign.story,
      category: campaign.category,
      goal_amount: campaign.goalAmount,
      raised_amount: campaign.raisedAmount,
      donor_count: campaign.donorCount,
      creator_name: campaign.creatorName,
      gradient_from: campaign.gradientFrom,
      gradient_to: campaign.gradientTo,
      hero_image_data_url: campaign.heroImageDataUrl || null,
    });

    if (!error) return; // ✅ persisted to DB
    console.error("[campaign-store] addCampaign Supabase error:", error);
    // Fall through to memory store as last resort
  }

  memStore().unshift(campaign);
}
