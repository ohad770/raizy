import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Enums ---

export const userRoleEnum = pgEnum("user_role", ["donor", "creator", "admin"]);
export const localeEnum = pgEnum("locale", ["he", "en"]);
export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "active",
  "completed",
  "suspended",
]);
export const campaignCategoryEnum = pgEnum("campaign_category", [
  "medical",
  "education",
  "community",
  "emergency",
  "personal",
  "business",
  "other",
]);
export const currencyEnum = pgEnum("currency", ["ILS", "USD", "EUR"]);
export const feeModelEnum = pgEnum("fee_model", [
  "donor_covers",
  "creator_covers",
]);
export const mediaTypeEnum = pgEnum("media_type", [
  "hero",
  "gallery",
  "video",
]);
export const donationStatusEnum = pgEnum("donation_status", [
  "pending",
  "completed",
  "failed",
  "expired",
  "refunded",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "initiated",
  "processing",
  "completed",
  "failed",
  "timed_out",
  "refunded",
]);
export const paymentProviderEnum = pgEnum("payment_provider", [
  "cardcom",
  "tranzila",
  "stripe",
]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "requested",
  "approved",
  "rejected",
  "transferred",
]);

// --- Tables ---

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Same as Supabase Auth user ID
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("donor"),
  avatarUrl: text("avatar_url"),
  localePreference: localeEnum("locale_preference").notNull().default("he"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    status: campaignStatusEnum("status").notNull().default("draft"),
    goalAmount: integer("goal_amount").notNull(), // in agorot
    currency: currencyEnum("currency").notNull().default("ILS"),
    category: campaignCategoryEnum("category").notNull(),
    feeModel: feeModelEnum("fee_model").notNull().default("creator_covers"),
    taxDeductible: boolean("tax_deductible").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    featuredOrder: integer("featured_order"),
    totalRaised: integer("total_raised").notNull().default(0), // denormalized
    donorCount: integer("donor_count").notNull().default(0), // denormalized
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("campaigns_status_idx").on(table.status),
    index("campaigns_category_status_idx").on(table.category, table.status),
    index("campaigns_featured_idx").on(table.featured, table.featuredOrder),
    index("campaigns_creator_idx").on(table.creatorId),
  ]
);

export const campaignContent = pgTable(
  "campaign_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    title: text("title").notNull(),
    shortDescription: varchar("short_description", { length: 160 }),
    story: jsonb("story"), // Tiptap JSON
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("campaign_content_locale_idx").on(
      table.campaignId,
      table.locale
    ),
  ]
);

export const campaignMedia = pgTable(
  "campaign_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    type: mediaTypeEnum("type").notNull(),
    url: text("url").notNull(),
    altText: text("alt_text"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("campaign_media_campaign_idx").on(table.campaignId)]
);

export const donations = pgTable(
  "donations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    donorId: uuid("donor_id").references(() => users.id),
    donorEmail: text("donor_email"),
    amount: integer("amount").notNull(), // in agorot
    currency: currencyEnum("currency").notNull().default("ILS"),
    status: donationStatusEnum("status").notNull().default("pending"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    displayName: text("display_name"),
    message: text("message"),
    idempotencyKey: uuid("idempotency_key").unique(),
    sessionId: uuid("session_id"),
    abandonedAt: timestamp("abandoned_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("donations_campaign_status_idx").on(table.campaignId, table.status),
    index("donations_donor_idx").on(table.donorId),
    index("donations_created_idx").on(table.createdAt),
  ]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    donationId: uuid("donation_id")
      .notNull()
      .unique()
      .references(() => donations.id),
    provider: paymentProviderEnum("provider").notNull(),
    providerTransactionId: text("provider_transaction_id"),
    status: paymentStatusEnum("status").notNull().default("initiated"),
    amount: integer("amount").notNull(), // in agorot
    currency: currencyEnum("currency").notNull().default("ILS"),
    providerMetadata: jsonb("provider_metadata"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("payments_provider_tx_idx").on(table.providerTransactionId),
  ]
);

export const campaignUpdates = pgTable(
  "campaign_updates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    title: text("title").notNull(),
    body: jsonb("body"), // Tiptap JSON
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("campaign_updates_campaign_idx").on(table.campaignId)]
);

export const withdrawalRequests = pgTable(
  "withdrawal_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id),
    amount: integer("amount").notNull(), // in agorot
    bankName: text("bank_name").notNull(),
    bankBranch: text("bank_branch").notNull(),
    bankAccount: text("bank_account").notNull(),
    idDocumentUrl: text("id_document_url"),
    status: withdrawalStatusEnum("status").notNull().default("requested"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    index("withdrawal_requests_campaign_idx").on(table.campaignId),
    index("withdrawal_requests_status_idx").on(table.status),
  ]
);

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
  donations: many(donations),
  withdrawalRequests: many(withdrawalRequests),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [campaigns.creatorId],
    references: [users.id],
  }),
  content: many(campaignContent),
  media: many(campaignMedia),
  donations: many(donations),
  updates: many(campaignUpdates),
  withdrawalRequests: many(withdrawalRequests),
}));

export const campaignContentRelations = relations(
  campaignContent,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaignContent.campaignId],
      references: [campaigns.id],
    }),
  })
);

export const campaignMediaRelations = relations(campaignMedia, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignMedia.campaignId],
    references: [campaigns.id],
  }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [donations.campaignId],
    references: [campaigns.id],
  }),
  donor: one(users, {
    fields: [donations.donorId],
    references: [users.id],
  }),
  payment: one(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  donation: one(donations, {
    fields: [payments.donationId],
    references: [donations.id],
  }),
}));

export const campaignUpdatesRelations = relations(
  campaignUpdates,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [campaignUpdates.campaignId],
      references: [campaigns.id],
    }),
  })
);

export const withdrawalRequestsRelations = relations(
  withdrawalRequests,
  ({ one }) => ({
    campaign: one(campaigns, {
      fields: [withdrawalRequests.campaignId],
      references: [campaigns.id],
    }),
    creator: one(users, {
      fields: [withdrawalRequests.creatorId],
      references: [users.id],
    }),
  })
);
