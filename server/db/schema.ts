import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";

// ==================== Auth Tables ====================

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

// ==================== File Table ====================

export const file = pgTable("files", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  bucket: text("bucket").notNull(),
  url: text("url").notNull(),
  usedAt: timestamp("used_at"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("file_user_id_idx").on(table.userId),
  index("file_key_idx").on(table.key),
]);

// ==================== ICP Tables ====================

export const icpIdentity = pgTable("icp_identity", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("individual"),
  description: text("description"),
  icon: text("icon"),
  iconFileId: text("icon_file_id").references(() => file.id, { onDelete: "set null" }),
  userId: text("user_id")
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
  iconFileId: text("icon_file_id").references(() => file.id, { onDelete: "set null" }),
  categories: text("categories"),
  approvedAt: timestamp("approved_at"),
  identityId: text("identity_id").references(() => icpIdentity.id),
  userId: text("user_id")
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
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  siteId: text("site_id").references(() => icpSite.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  data: text("data").notNull(),
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

// ==================== Relations ====================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  files: many(file),
  icpIdentities: many(icpIdentity),
  icpSubmissions: many(icpSubmission),
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

export const fileRelations = relations(file, ({ one }) => ({
  user: one(user, {
    fields: [file.userId],
    references: [user.id],
  }),
}));

export const icpSiteRelations = relations(icpSite, ({ one, many }) => ({
  user: one(user, {
    fields: [icpSite.userId],
    references: [user.id],
  }),
  identity: one(icpIdentity, {
    fields: [icpSite.identityId],
    references: [icpIdentity.id],
  }),
  iconFile: one(file, {
    fields: [icpSite.iconFileId],
    references: [file.id],
    relationName: "siteIconFile",
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
  iconFile: one(file, {
    fields: [icpIdentity.iconFileId],
    references: [file.id],
    relationName: "identityIconFile",
  }),
  sites: many(icpSite),
}));
