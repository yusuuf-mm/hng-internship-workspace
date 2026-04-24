require('dotenv').config();
const pool = require('./db');
const { v7: uuidv7 } = require('uuid');
const fs = require('fs');

async function seed() {
  const raw = fs.readFileSync('./seed_profiles.json', 'utf8');
  const { profiles } = JSON.parse(raw);

  console.log(`🌱 Seeding ${profiles.length} profiles...`);

  let inserted = 0;
  let skipped = 0;

  for (const p of profiles) {
    try {
      await pool.query(
        `INSERT INTO profiles
          (id, name, gender, gender_probability, age, age_group, country_id, country_name, country_probability)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (name) DO NOTHING`,
        [
          uuidv7(),
          p.name,
          p.gender,
          p.gender_probability,
          p.age,
          p.age_group,
          p.country_id,
          p.country_name,
          p.country_probability
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`❌ Failed on ${p.name}:`, err.message);
      skipped++;
    }
  }

  console.log(`✅ Done! Inserted: ${inserted} | Skipped (duplicates): ${skipped}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
