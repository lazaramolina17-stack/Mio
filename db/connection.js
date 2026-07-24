require('dotenv').config();
const { Pool } = require('pg');

const isDev = process.env.NODE_ENV !== 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  if (isDev) {
    console.log('[DB] New connection established');
  }
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (isDev) {
    console.log('[DB] Query executed', {
      text: text.substring(0, 200),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
  }

  return result;
}

async function getClient() {
  const client = await pool.connect();
  return client;
}

async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  getClient,
  transaction,
  pool,
};
