import { pgTable, text, timestamp, boolean, uuid, index } from 'drizzle-orm/pg-core';

export const userRoleEnum = [
  'GUEST',
  'CUSTOMER',
  'MEMBER',
  'TAILOR',
  'FULFILLMENT',
  'SUPPORT',
  'ADMIN',
] as const;

export const usersProfile = pgTable(
  'users_profile',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    fullName: text('full_name').notNull(),
    role: text('role', { enum: userRoleEnum }).notNull().default('CUSTOMER'),
    phone: text('phone'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_users_profile_email').on(table.email),
    index('idx_users_profile_role').on(table.role),
  ],
);

export const addresses = pgTable(
  'addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => usersProfile.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    addressLine1: text('address_line1').notNull(),
    addressLine2: text('address_line2'),
    city: text('city').notNull(),
    stateOrProvince: text('state_or_province'),
    postalCode: text('postal_code').notNull(),
    country: text('country').notNull().default('NP'),
    phone: text('phone').notNull(),
    isDefaultShipping: boolean('is_default_shipping').notNull().default(false),
    isDefaultBilling: boolean('is_default_billing').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_addresses_user_id').on(table.userId)],
);
