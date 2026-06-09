/**
 * Run Supabase schema SQL directly via PostgreSQL connection.
 * Usage: node scripts/setup-supabase.js
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'pmvletkipbupbejhouhp';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!DB_PASSWORD) {
  console.error('ERROR: SUPABASE_DB_PASSWORD environment variable is required.');
  console.error('Usage: SUPABASE_DB_PASSWORD=your_password SUPABASE_PROJECT_REF=your_ref node scripts/setup-supabase.js');
  process.exit(1);
}

const client = new Client({
  host: `db.${PROJECT_REF}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('Connected successfully.');

  const sql = fs.readFileSync(
    path.join(__dirname, '..', 'supabase-schema.sql'),
    'utf8'
  );

  console.log('Running schema SQL...');
  await client.query(sql);
  console.log('Schema created successfully.');

  // Verify
  const { rows } = await client.query(`
    SELECT table_name, table_type
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log('\nTables in public schema:');
  rows.forEach(r => console.log(`  ${r.table_name} (${r.table_type})`));

  const { rows: policies } = await client.query(`
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  `);
  console.log('\nRLS Policies:');
  policies.forEach(p => console.log(`  ${p.tablename}: ${p.policyname}`));

  await client.end();
  console.log('\nDone! Supabase is ready.');
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
