/**
 * Drizzle ORM Schema for better-auth
 *
 * This schema includes all tables needed by better-auth core
 * and common plugins (organizations, 2FA, etc.)
 *
 * Use with PostgreSQL or Cloudflare D1
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core' // For D1
// OR for PostgreSQL:
// import { pgTable, text, timestamp, boolean, json } from 'drizzle-orm/pg-core'

// ============================================================================
// Core better-auth Tables
// ============================================================================

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  name: text('name'),
  image: text('image'),
  role: text('role').default('user'), // Custom field for RBAC
  bio: text('bio'), // Custom field
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// Accounts table (for OAuth providers)
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'google', 'github', etc.
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

// Verification tokens (for email verification, password reset)
export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(), // email or user ID
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// ============================================================================
// Organizations Plugin Tables
// ============================================================================

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logo: text('logo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

export const organizationMembers = sqliteTable('organization_members', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'owner', 'admin', 'member'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const organizationInvitations = sqliteTable('organization_invitations', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull(),
  invitedBy: text('invited_by').notNull().references(() => users.id),
  token: text('token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// ============================================================================
// Two-Factor Authentication Plugin Tables
// ============================================================================

export const twoFactorSecrets = sqliteTable('two_factor_secrets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  secret: text('secret').notNull(),
  method: text('method').notNull(), // 'totp', 'sms'
  enabled: integer('enabled', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const twoFactorBackupCodes = sqliteTable('two_factor_backup_codes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  used: integer('used', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// ============================================================================
// Custom Application Tables (Examples)
// ============================================================================

// Example: User preferences
export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme').default('system'), // 'light', 'dark', 'system'
  language: text('language').default('en'),
  notifications: integer('notifications', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

// Example: Audit log
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // 'login', 'logout', 'password_change', etc.
  resource: text('resource'), // 'user', 'organization', etc.
  resourceId: text('resource_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: text('metadata'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// ============================================================================
// PostgreSQL Version (Alternative to SQLite above)
// ============================================================================

/*
import { pgTable, text, timestamp, boolean, json } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  name: text('name'),
  image: text('image'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// ... similar structure for other tables
*/

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Account = typeof accounts.$inferSelect
export type Organization = typeof organizations.$inferSelect
export type OrganizationMember = typeof organizationMembers.$inferSelect
