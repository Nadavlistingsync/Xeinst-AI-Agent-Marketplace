import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { createClient } from '@supabase/supabase-js';
import * as schema from '../src/lib/schema';

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials not found');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('Neon DATABASE_URL not found');
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  // Initialize Neon client
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  console.log('Starting migration...');

  try {
    // Migrate users
    console.log('Migrating users...');
    const { data: users } = await supabase.from('users').select('*');
    if (users?.length) {
      await db.insert(schema.users).values(users);
    }

    // Migrate products
    console.log('Migrating products...');
    const { data: products } = await supabase.from('products').select('*');
    if (products?.length) {
      await db.insert(schema.products).values(products);
    }

    // Migrate deployments
    console.log('Migrating deployments...');
    const { data: deployments } = await supabase.from('deployments').select('*');
    if (deployments?.length) {
      await db.insert(schema.deployments).values(deployments);
    }

    // Migrate earnings
    console.log('Migrating earnings...');
    const { data: earnings } = await supabase.from('earnings').select('*');
    if (earnings?.length) {
      await db.insert(schema.earnings).values(earnings);
    }

    // Migrate reviews
    console.log('Migrating reviews...');
    const { data: reviews } = await supabase.from('reviews').select('*');
    if (reviews?.length) {
      await db.insert(schema.reviews).values(reviews);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 