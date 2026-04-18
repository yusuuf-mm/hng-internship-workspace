require('dotenv').config();
const pool = require('./db');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      gender TEXT,
      gender_probability NUMERIC,
      sample_size INTEGER,
      age INTEGER,
      age_group TEXT,
      country_id TEXT,
      country_probability NUMERIC,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Table created successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});