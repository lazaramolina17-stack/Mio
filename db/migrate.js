const fs = require('fs');
const path = require('path');
const { query, transaction } = require('./connection');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const SEEDS_DIR = path.join(__dirname, 'seeds');

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrations() {
  const result = await query('SELECT name FROM _migrations ORDER BY name');
  return new Set(result.rows.map(r => r.name));
}

async function runMigrations() {
  await ensureMigrationsTable();
  const executed = await getExecutedMigrations();

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('[migrate] No migration files found');
    return;
  }

  for (const file of files) {
    if (executed.has(file)) {
      console.log(`[migrate] Skipping ${file} (already executed)`);
      continue;
    }

    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`[migrate] Running ${file}...`);

    await transaction(async (client) => {
      await client.query(sql);
      await client.query(
        'INSERT INTO _migrations (name) VALUES ($1)',
        [file]
      );
    });

    console.log(`[migrate] Done ${file}`);
  }

  console.log('[migrate] All migrations completed');
}

async function runSeeds() {
  await ensureMigrationsTable();

  const files = fs.readdirSync(SEEDS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('[seed] No seed files found');
    return;
  }

  for (const file of files) {
    const seedName = `seed:${file}`;
    const result = await query('SELECT 1 FROM _migrations WHERE name = $1', [seedName]);

    if (result.rowCount > 0) {
      console.log(`[seed] Skipping ${file} (already executed)`);
      continue;
    }

    const filePath = path.join(SEEDS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`[seed] Running ${file}...`);

    await transaction(async (client) => {
      await client.query(sql);
      await client.query(
        'INSERT INTO _migrations (name) VALUES ($1)',
        [seedName]
      );
    });

    console.log(`[seed] Done ${file}`);
  }

  console.log('[seed] All seeds completed');
}

async function runAll() {
  await runMigrations();
  await runSeeds();
  process.exit(0);
}

const command = process.argv[2];

switch (command) {
  case 'db:migrate':
    runMigrations().then(() => process.exit(0)).catch((err) => {
      console.error('[migrate] Error:', err);
      process.exit(1);
    });
    break;

  case 'db:seed':
    runSeeds().then(() => process.exit(0)).catch((err) => {
      console.error('[seed] Error:', err);
      process.exit(1);
    });
    break;

  case 'db:setup':
    runAll().catch((err) => {
      console.error('[setup] Error:', err);
      process.exit(1);
    });
    break;

  default:
    console.log('Usage: node db/migrate.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  db:migrate    Run pending migrations');
    console.log('  db:seed       Run pending seeds');
    console.log('  db:setup      Run migrations + seeds');
    process.exit(1);
}
