import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function compareTableCounts(tableName: string) {
  const { count: supabaseCount } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  const neonCount = await db.select({ count: sql`count(*)` })
    .from(schema[tableName as keyof typeof schema])
    .then(rows => Number(rows[0].count));

  return {
    table: tableName,
    supabase: supabaseCount,
    neon: neonCount,
    match: supabaseCount === neonCount
  };
}

async function verifyDataIntegrity(tableName: string) {
  const { data: supabaseData } = await supabase
    .from(tableName)
    .select('*');

  const neonData = await db.select()
    .from(schema[tableName as keyof typeof schema]);

  const mismatches = [];

  for (const supabaseRow of supabaseData || []) {
    const neonRow = neonData.find(row => row.id === supabaseRow.id);
    if (!neonRow) {
      mismatches.push({
        id: supabaseRow.id,
        type: 'missing_in_neon',
        supabase: supabaseRow
      });
      continue;
    }

    const differences = Object.keys(supabaseRow).filter(key => {
      if (key === 'created_at' || key === 'updated_at') return false;
      return JSON.stringify(supabaseRow[key]) !== JSON.stringify(neonRow[key]);
    });

    if (differences.length > 0) {
      mismatches.push({
        id: supabaseRow.id,
        type: 'data_mismatch',
        differences,
        supabase: supabaseRow,
        neon: neonRow
      });
    }
  }

  return {
    table: tableName,
    totalRecords: supabaseData?.length || 0,
    mismatches,
    hasIssues: mismatches.length > 0
  };
}

async function main() {
  const tables = ['users', 'products', 'reviews', 'deployments', 'earnings'];
  
  console.log('Checking table counts...\n');
  for (const table of tables) {
    const result = await compareTableCounts(table);
    console.log(`${table}:`);
    console.log(`  Supabase: ${result.supabase}`);
    console.log(`  Neon: ${result.neon}`);
    console.log(`  Match: ${result.match ? '✅' : '❌'}\n`);
  }

  console.log('\nVerifying data integrity...\n');
  for (const table of tables) {
    const result = await verifyDataIntegrity(table);
    console.log(`${table}:`);
    console.log(`  Total Records: ${result.totalRecords}`);
    console.log(`  Issues Found: ${result.mismatches.length}`);
    
    if (result.hasIssues) {
      console.log('  Details:');
      result.mismatches.forEach(mismatch => {
        console.log(`    - ID: ${mismatch.id}`);
        console.log(`      Type: ${mismatch.type}`);
        if (mismatch.type === 'data_mismatch') {
          console.log(`      Differences: ${mismatch.differences.join(', ')}`);
        }
      });
    }
    console.log('');
  }
}

main().catch(console.error); 