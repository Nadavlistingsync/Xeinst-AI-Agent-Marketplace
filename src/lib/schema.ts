import { pgTable, uuid, text, timestamp, decimal, boolean, integer } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  documentation: text('documentation'),
  file_url: text('file_url').notNull(),
  uploaded_by: uuid('uploaded_by').references(() => users.id),
  is_public: boolean('is_public').default(true),
  is_featured: boolean('is_featured').default(false),
  earnings_split: decimal('earnings_split', { precision: 3, scale: 2 }).default('0.70'),
  status: text('status').default('pending'),
  download_count: integer('download_count').default(0),
  average_rating: decimal('average_rating', { precision: 3, scale: 2 }),
  total_ratings: integer('total_ratings').default(0),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  full_name: text('full_name'),
  stripe_customer_id: text('stripe_customer_id'),
  stripe_account_id: text('stripe_account_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  product_id: uuid('product_id').references(() => products.id).onDelete('cascade'),
  user_id: uuid('user_id').references(() => users.id).onDelete('cascade'),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const earnings = pgTable('earnings', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.id),
  product_id: uuid('product_id').references(() => products.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('pending'),
  stripe_transfer_id: text('stripe_transfer_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  paid_at: timestamp('paid_at', { withTimezone: true }),
});

export const deployments = pgTable('deployments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  model_type: text('model_type').notNull(),
  framework: text('framework').notNull(),
  requirements: text('requirements'),
  api_endpoint: text('api_endpoint'),
  environment: text('environment').notNull().default('production'),
  version: text('version').notNull(),
  file_url: text('file_url').notNull(),
  status: text('status').notNull().default('pending'),
  deployed_by: uuid('deployed_by').references(() => users.id),
  source: text('source').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}); 