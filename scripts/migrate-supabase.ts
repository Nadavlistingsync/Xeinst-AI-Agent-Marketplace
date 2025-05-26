import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Neon client
const neonUrl = process.env.DATABASE_URL;

if (!neonUrl) {
  throw new Error('Missing Neon database URL');
}

const sql = neon(neonUrl);
const db = drizzle(sql, { schema });

async function migrateUsers() {
  console.log('Migrating users...');
  const { data: users, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    throw error;
  }

  for (const user of users) {
    await db.insert(schema.users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  }
  console.log(`Migrated ${users.length} users`);
}

async function migrateProducts() {
  console.log('Migrating products...');
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    throw error;
  }

  for (const product of products) {
    await db.insert(schema.products).values({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      user_id: product.user_id,
      created_at: product.created_at,
      updated_at: product.updated_at,
      is_featured: product.is_featured || false,
    });
  }
  console.log(`Migrated ${products.length} products`);
}

async function migrateReviews() {
  console.log('Migrating reviews...');
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*');

  if (error) {
    throw error;
  }

  for (const review of reviews) {
    await db.insert(schema.reviews).values({
      id: review.id,
      product_id: review.product_id,
      user_id: review.user_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      updated_at: review.updated_at,
    });
  }
  console.log(`Migrated ${reviews.length} reviews`);
}

async function migrateDeployments() {
  console.log('Migrating deployments...');
  const { data: deployments, error } = await supabase
    .from('deployments')
    .select('*');

  if (error) {
    throw error;
  }

  for (const deployment of deployments) {
    await db.insert(schema.deployments).values({
      id: deployment.id,
      product_id: deployment.product_id,
      status: deployment.status,
      url: deployment.url,
      created_at: deployment.created_at,
      updated_at: deployment.updated_at,
    });
  }
  console.log(`Migrated ${deployments.length} deployments`);
}

async function migrateEarnings() {
  console.log('Migrating earnings...');
  const { data: earnings, error } = await supabase
    .from('earnings')
    .select('*');

  if (error) {
    throw error;
  }

  for (const earning of earnings) {
    await db.insert(schema.earnings).values({
      id: earning.id,
      user_id: earning.user_id,
      amount: earning.amount,
      type: earning.type,
      created_at: earning.created_at,
      updated_at: earning.updated_at,
    });
  }
  console.log(`Migrated ${earnings.length} earnings records`);
}

async function main() {
  try {
    console.log('Starting migration...');
    
    await migrateUsers();
    await migrateProducts();
    await migrateReviews();
    await migrateDeployments();
    await migrateEarnings();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 