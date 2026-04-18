require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
  if (err) {
    console.error('❌ DB connection failed:', err.message);
  } else {
    console.log('✅ DB connected successfully');
  }
});

module.exports = pool;