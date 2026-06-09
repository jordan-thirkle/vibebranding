/**
 * Supabase Migration Runner
 *
 * Applies numbered SQL migrations from supabase/migrations/ in order.
 * Tracks applied migrations in a `_migrations` table (idempotent).
 *
 * Usage:
 *   SUPABASE_DB_PASSWORD=your_password node scripts/migrate-supabase.js
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
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

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

async function getAppliedMigrations(client) {
  try {
    const { rows } = await client.query(
      'SELECT name FROM _migrations ORDER BY name'
    );
    return new Set(rows.map(r => r.name));
  } catch {
    // _migrations table doesn't exist yet — first run
    return new Set();
  }
}

async function ensureTrackingTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function main() {
  console.log('=== Supabase Migration Runner ===');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Migrations: ${MIGRATIONS_DIR}`);
  console.log('');

  // Resolve DNS
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

  console.log('\nConnecting...');
  await client.connect();
  console.log('Connected.\n');

  // Ensure migration tracking table
  await ensureTrackingTable(client);
  const applied = await getAppliedMigrations(client);

  // Discover migration files
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found in supabase/migrations/');
    await client.end();
    return;
  }

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ⏭️  ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`  ▶️  Applying ${file}...`);

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO _migrations (name) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      console.log(`  ✅ ${file} applied`);
      ran++;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  ❌ ${file} FAILED: ${err.message}`);
      console.error('Rolled back. Fix the migration and re-run.');
      await client.end();
      process.exitCode = 1;
      return;
    }
  }

  // Verify
  const { rows: tables } = await client.query(`
    SELECT table_name, table_type
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name NOT LIKE '_%'
    ORDER BY table_name
  `);
  console.log('\nTables in public schema:');
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
  console.log(`\n=== Done! ${ran} migration(s) applied. ===`);
}

main().catch(err => {
  console.error(`\nMigration failed: ${err.message}`);
  console.error('Run individual SQL files manually in Supabase Dashboard SQL Editor.');
  process.exitCode = 1;
});
