import { pgTable, uuid, text, timestamp, decimal, boolean, integer, json } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  long_description: text('long_description'),
  category: text('category').notNull(),
  price: text('price').notNull(),
  image_url: text('image_url'),
  file_url: text('file_url').notNull(),
  documentation: text('documentation'),
  features: json('features').$type<string[]>(),
  requirements: json('requirements').$type<string[]>(),
  rating: integer('rating').default(0),
  average_rating: integer('average_rating').default(0),
  total_ratings: integer('total_ratings').default(0),
  created_by: text('created_by').notNull(),
  uploaded_by: text('uploaded_by').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  is_public: boolean('is_public').default(true).notNull(),
  is_featured: boolean('is_featured').default(false).notNull(),
  download_count: integer('download_count').default(0),
  earnings_split: decimal('earnings_split', { precision: 3, scale: 2 }).default('0.70'),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  image: text('image'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  product_id: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
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

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.id),
  product_id: uuid('product_id').references(() => products.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('pending'),
  stripe_payment_intent_id: text('stripe_payment_intent_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: integer('size').notNull(),
  data: text('data').notNull(), // Base64 encoded file data
  uploaded_by: text('uploaded_by').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const schema = {
  products,
  users,
  reviews,
  earnings,
  deployments,
  purchases,
  files,
}; 