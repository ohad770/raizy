import { mockCampaigns, type MockCampaign } from "./mock-campaigns";

// Module-level mutable store — persists across requests in the same process.
// Resets on server restart (expected for in-memory MVP behavior).
let store: MockCampaign[] = [...mockCampaigns];

export function getCampaignBySlugFromStore(slug: string): MockCampaign | null {
  return store.find((c) => c.slug === slug) ?? null;
}

export function isSlugTaken(slug: string): boolean {
  return store.some((c) => c.slug === slug);
}

export function addCampaign(campaign: MockCampaign): void {
  store = [campaign, ...store];
}

export function getAllCampaigns(): MockCampaign[] {
  return store;
}
