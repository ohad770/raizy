import { mockCampaigns, type MockCampaign } from "./mock-campaigns";

// Next.js App Router runs API Route Handlers and React Server Components in
// separate module-graph contexts, so a plain `let store` would be a different
// instance in each context. Using `globalThis` guarantees a single shared
// store across all contexts within the same Node.js process.
declare global {
  // eslint-disable-next-line no-var
  var __raizy_campaign_store: MockCampaign[] | undefined;
}

function getStore(): MockCampaign[] {
  if (!globalThis.__raizy_campaign_store) {
    globalThis.__raizy_campaign_store = [...mockCampaigns];
  }
  return globalThis.__raizy_campaign_store;
}

export function getCampaignBySlugFromStore(slug: string): MockCampaign | null {
  return getStore().find((c) => c.slug === slug) ?? null;
}

export function isSlugTaken(slug: string): boolean {
  return getStore().some((c) => c.slug === slug);
}

export function addCampaign(campaign: MockCampaign): void {
  getStore().unshift(campaign);
}

export function getAllCampaigns(): MockCampaign[] {
  return getStore();
}
