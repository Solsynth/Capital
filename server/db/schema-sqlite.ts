import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// ==================== Auth Tables ====================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
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
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ==================== File Table ====================

export const file = sqliteTable("files", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(), // S3 object key
  name: text("name").notNull(), // Original filename
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // bytes
  bucket: text("bucket").notNull(),
  url: text("url").notNull(), // Public URL
  usedAt: integer("used_at", { mode: "timestamp_ms" }), // When the file was last linked to a record
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("file_user_id_idx").on(table.userId),
  index("file_key_idx").on(table.key),
]);

// ==================== ICP Tables ====================

export const icpIdentity = sqliteTable("icp_identity", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("individual"), // 'individual' | 'organization'
  description: text("description"),
  icon: text("icon"), // Legacy: direct URL string
  iconFileId: text("icon_file_id").references(() => file.id, { onDelete: "set null" }),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("icp_identity_user_id_idx").on(table.userId),
]);

export const icpSite = sqliteTable("icp_site", {
  id: text("id").primaryKey(),
  fillingNo: text("filling_no").notNull().unique(),
  domain: text("domain").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  siteUrl: text("site_url").notNull(),
  icon: text("icon"), // Legacy: direct URL string
  iconFileId: text("icon_file_id").references(() => file.id, { onDelete: "set null" }),
  categories: text("categories"), // JSON string
  approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
  identityId: text("identity_id").references(() => icpIdentity.id),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("icp_site_filling_no_idx").on(table.fillingNo),
  index("icp_site_user_id_idx").on(table.userId),
]);

export const icpSubmission = sqliteTable("icp_submission", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'create' | 'update'
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  siteId: text("site_id").references(() => icpSite.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  data: text("data").notNull(), // JSON string with submission data
  reviewNote: text("review_note"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  reviewedBy: text("reviewed_by").references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
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
