import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  icpIdentities: many(icpIdentity),
  icpSubmissions: many(icpSubmission),
}));

// ICP Tables

export const icpIdentity = pgTable("icp_identity", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("individual"), // 'individual' | 'organization'
  description: text("description"),
  icon: text("icon"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("icp_identity_user_id_idx").on(table.userId),
]);

export const icpSite = pgTable("icp_site", {
  id: text("id").primaryKey(),
  fillingNo: text("filling_no").notNull().unique(),
  domain: text("domain").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  siteUrl: text("site_url").notNull(),
  icon: text("icon"),
  categories: text("categories"), // JSON string
  approvedAt: timestamp("approved_at"),
  identityId: text("identity_id").references(() => icpIdentity.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("icp_site_filling_no_idx").on(table.fillingNo),
  index("icp_site_user_id_idx").on(table.userId),
]);

export const icpSubmission = pgTable("icp_submission", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'create' | 'update'
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  siteId: text("site_id").references(() => icpSite.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  data: text("data").notNull(), // JSON string with submission data
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("icp_submission_user_id_idx").on(table.userId),
  index("icp_submission_status_idx").on(table.status),
]);

export const icpSiteRelations = relations(icpSite, ({ one, many }) => ({
  user: one(user, {
    fields: [icpSite.userId],
    references: [user.id],
  }),
  identity: one(icpIdentity, {
    fields: [icpSite.identityId],
    references: [icpIdentity.id],
  }),
  submissions: many(icpSubmission),
}));

export const icpSubmissionRelations = relations(icpSubmission, ({ one }) => ({
  site: one(icpSite, {
    fields: [icpSubmission.siteId],
    references: [icpSite.id],
  }),
  user: one(user, {
    fields: [icpSubmission.userId],
    references: [user.id],
  }),
  reviewer: one(user, {
    fields: [icpSubmission.reviewedBy],
    references: [user.id],
  }),
}));

export const icpIdentityRelations = relations(icpIdentity, ({ one, many }) => ({
  user: one(user, {
    fields: [icpIdentity.userId],
    references: [user.id],
  }),
  sites: many(icpSite),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
