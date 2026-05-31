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
  is_active?: boolean | null;
  disabled_at?: string | null;
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
    isActive: row.is_active ?? true,
    disabledAt: row.disabled_at ?? undefined,
    recentDonations: [],
  };
}

function campaignIsActive(campaign: MockCampaign): boolean {
  return campaign.isActive !== false;
}

// ─── GlobalThis fallback ───────────────────────────────────────────────────

declare global {
  var __raizy_campaign_store: MockCampaign[] | undefined;
}

function memStore(): MockCampaign[] {
  if (!globalThis.__raizy_campaign_store) {
    globalThis.__raizy_campaign_store = mockCampaigns.map((campaign) => ({
      ...campaign,
      isActive: campaign.isActive ?? true,
    }));
  }
  return globalThis.__raizy_campaign_store;
}

// ─── Public async API ──────────────────────────────────────────────────────

interface CampaignQueryOptions {
  includeInactive?: boolean;
}

function filterCampaigns(
  campaigns: MockCampaign[],
  options: CampaignQueryOptions = {}
): MockCampaign[] {
  if (options.includeInactive) return campaigns;
  return campaigns.filter(campaignIsActive);
}

function setMemoryCampaignActive(id: string, isActive: boolean): boolean {
  const campaign = memStore().find((item) => item.id === id);
  if (!campaign) return false;

  campaign.isActive = isActive;
  campaign.disabledAt = isActive ? undefined : new Date().toISOString();
  return true;
}

function deleteMemoryCampaign(id: string): boolean {
  const store = memStore();
  const index = store.findIndex((campaign) => campaign.id === id);
  if (index === -1) return false;

  store.splice(index, 1);
  return true;
}

export async function getAllCampaigns(
  options: CampaignQueryOptions = {}
): Promise<MockCampaign[]> {
  const sb = getSupabaseServer();
  if (sb) {
    const { data, error } = await sb
      .from("mvp_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const dbCampaigns = (data as DbRow[]).map(rowToCampaign);
      // Merge: DB campaigns first, then any local fallback campaigns not in the DB.
      const dbSlugs = new Set(dbCampaigns.map((c) => c.slug));
      const extras = memStore().filter((m) => !dbSlugs.has(m.slug));
      return filterCampaigns([...dbCampaigns, ...extras], options);
    }
    console.error("[campaign-store] getAllCampaigns Supabase error:", error);
  }

  return filterCampaigns(memStore(), options);
}

export async function getCampaignBySlugFromStore(
  slug: string,
  options: CampaignQueryOptions = {}
): Promise<MockCampaign | null> {
  const sb = getSupabaseServer();
  if (sb) {
    const { data, error } = await sb
      .from("mvp_campaigns")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      const campaign = rowToCampaign(data as DbRow);
      if (!options.includeInactive && !campaignIsActive(campaign)) return null;
      return campaign;
    }
    if (error) console.error("[campaign-store] getCampaignBySlug error:", error);
  }

  const campaign = memStore().find((c) => c.slug === slug) ?? null;
  if (!campaign) return null;
  if (!options.includeInactive && !campaignIsActive(campaign)) return null;
  return campaign;
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
  const activeCampaign = {
    ...campaign,
    isActive: campaign.isActive ?? true,
  };
  const sb = getSupabaseServer();
  if (sb) {
    const { error } = await sb.from("mvp_campaigns").insert({
      id: activeCampaign.id,
      slug: activeCampaign.slug,
      title: activeCampaign.title,
      short_description: activeCampaign.shortDescription || null,
      story: activeCampaign.story,
      category: activeCampaign.category,
      goal_amount: activeCampaign.goalAmount,
      raised_amount: activeCampaign.raisedAmount,
      donor_count: activeCampaign.donorCount,
      creator_name: activeCampaign.creatorName,
      gradient_from: activeCampaign.gradientFrom,
      gradient_to: activeCampaign.gradientTo,
      hero_image_data_url: activeCampaign.heroImageDataUrl || null,
    });

    if (!error) return; // ✅ persisted to DB
    console.error("[campaign-store] addCampaign Supabase error:", error);
    // Fall through to memory store as last resort
  }

  memStore().unshift(activeCampaign);
}

export async function setCampaignActive(
  id: string,
  isActive: boolean
): Promise<boolean> {
  const disabledAt = isActive ? null : new Date().toISOString();
  const sb = getSupabaseServer();

  if (sb) {
    const { data, error } = await sb
      .from("mvp_campaigns")
      .update({ is_active: isActive, disabled_at: disabledAt })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[campaign-store] setCampaignActive Supabase error:", error);
      return setMemoryCampaignActive(id, isActive);
    }

    if (data) return true;
  }

  return setMemoryCampaignActive(id, isActive);
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const sb = getSupabaseServer();

  if (sb) {
    const { data, error } = await sb
      .from("mvp_campaigns")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[campaign-store] deleteCampaign Supabase error:", error);
      return deleteMemoryCampaign(id);
    }

    if (data) return true;
  }

  return deleteMemoryCampaign(id);
}
