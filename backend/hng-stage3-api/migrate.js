require('dotenv').config();
const pool = require('./db');

async function migrate() {
  await pool.query(`
    DROP TABLE IF EXISTS profiles;
    CREATE TABLE profiles (
      id                  TEXT PRIMARY KEY,
      name                VARCHAR UNIQUE NOT NULL,
      gender              VARCHAR,
      gender_probability  FLOAT,
      sample_size         INTEGER,
      age                 INTEGER,
      age_group           VARCHAR,
      country_id          VARCHAR(2),
      country_name        VARCHAR,
      country_probability FLOAT,
      created_at          TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Table created fresh with country_name!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
