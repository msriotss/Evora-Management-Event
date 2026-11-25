import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('peserta'),
  verified: boolean('verified').notNull().default(false),
  avatarConfig: text('avatar_config'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const otpTokens = pgTable('otp_tokens', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('peserta'),
  passwordHash: text('password_hash').notNull(),
  otpHash: text('otp_hash').notNull(),
  attempts: integer('attempts').notNull().default(0),
  consumed: boolean('consumed').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailBroadcasts = pgTable('email_broadcasts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  deliveryMode: text('delivery_mode').notNull().default('preview'),
  sentAt: timestamp('sent_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  broadcasts: many(emailBroadcasts),
}));

export const emailBroadcastsRelations = relations(emailBroadcasts, ({ one }) => ({
  user: one(users, {
    fields: [emailBroadcasts.userId],
    references: [users.id],
  }),
}));
