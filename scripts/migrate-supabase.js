/**
 * Supabase Schema Migration Script
 * 
 * Applies supabase-schema.sql to the Supabase PostgreSQL database.
 * Run this when DNS for db.[ref].supabase.co has propagated.
 * 
 * Usage:
 *   node scripts/migrate-supabase.js
 * 
 * Or with a different password:
 *   SUPABASE_DB_PASSWORD=other pw node scripts/migrate-supabase.js
 * 
 * The script retries DNS resolution up to 30 times (30 seconds total).
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'pmvletkipbupbejhouhp';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!DB_PASSWORD) {
  console.error('ERROR: SUPABASE_DB_PASSWORD environment variable is required.');
  console.error('Usage: SUPABASE_DB_PASSWORD=your_password node scripts/migrate-supabase.js');
  process.exit(1);
}

const DB_HOST = `db.${PROJECT_REF}.supabase.co`;

async function resolveHost(host, retries = 30, interval = 2000) {
  console.log(`Resolving ${host}...`);
  for (let i = 0; i < retries; i++) {
    try {
      const { promises: dns } = require('dns');
      const addresses = await dns.resolve4(host);
      console.log(`Resolved ${host} -> ${addresses[0]} (attempt ${i + 1})`);
      return addresses[0];
    } catch {
      if (i < retries - 1) {
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, interval));
      }
    }
  }
  throw new Error(`Could not resolve ${host} after ${retries} attempts`);
}

async function main() {
  console.log('=== Supabase Schema Migration ===');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Host: ${DB_HOST}`);
  console.log('');

  // Resolve DNS with retry
  await resolveHost(DB_HOST);

  // Connect
  const client = new Client({
    host: DB_HOST,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  console.log('\nConnecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('Connected successfully.\n');

  // Run schema
  const sqlPath = path.join(__dirname, '..', 'supabase-schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Running schema SQL...');
  await client.query(sql);
  console.log('Schema created successfully.\n');

  // Verify
  const { rows: tables } = await client.query(`
    SELECT table_name, table_type
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log('Tables in public schema:');
  tables.forEach(r => console.log(`  ${r.table_name} (${r.table_type})`));

  const { rows: policies } = await client.query(`
    SELECT tablename, policyname, permissive, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  `);
  console.log('\nRLS Policies:');
  policies.forEach(p => console.log(`  ${p.tablename}: ${p.policyname} (${p.permissive} ${p.cmd})`));

  await client.end();
  console.log('\n=== Migration complete! ===');
  console.log('Supabase project is ready for production.');
}

main().catch(err => {
  console.error(`\nMigration failed: ${err.message}`);
  console.error('The schema SQL is at supabase-schema.sql — you can run it manually in the Supabase Dashboard SQL Editor.');
  process.exitCode = 1;
});
