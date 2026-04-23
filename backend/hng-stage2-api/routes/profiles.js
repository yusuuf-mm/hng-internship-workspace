const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v7: uuidv7 } = require('uuid');
const pool = require('../db');

// Helper: classify age group
function classifyAge(age) {
  if (age <= 12) return 'child';
  if (age <= 19) return 'teenager';
  if (age <= 59) return 'adult';
  return 'senior';
}

// POST /api/profiles
router.post('/', async (req, res) => {
  const { name } = req.body;

  // 1. Validate input
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'Missing or empty name' });
  }

  if (typeof name !== 'string') {
    return res.status(422).json({ status: 'error', message: 'Invalid type' });
  }

  const cleanName = name.trim().toLowerCase();

  // 2. Check if profile already exists
  const existing = await pool.query(
    'SELECT * FROM profiles WHERE name = $1', [cleanName]
  );

  if (existing.rows.length > 0) {
    return res.status(200).json({
      status: 'success',
      message: 'Profile already exists',
      data: existing.rows[0]
    });
  }

  // 3. Call all 3 external APIs
  try {
    const [genderRes, agifyRes, nationalizeRes] = await Promise.all([
      axios.get(`https://api.genderize.io?name=${cleanName}`),
      axios.get(`https://api.agify.io?name=${cleanName}`),
      axios.get(`https://api.nationalize.io?name=${cleanName}`)
    ]);

    const genderData = genderRes.data;
    const agifyData = agifyRes.data;
    const nationalizeData = nationalizeRes.data;

    // 4. Validate external API responses
    if (!genderData.gender || genderData.count === 0) {
      return res.status(502).json({ status: 'error', message: 'Genderize returned an invalid response' });
    }
    if (!agifyData.age) {
      return res.status(502).json({ status: 'error', message: 'Agify returned an invalid response' });
    }
    if (!nationalizeData.country || nationalizeData.country.length === 0) {
      return res.status(502).json({ status: 'error', message: 'Nationalize returned an invalid response' });
    }

    // 5. Extract and classify
    const gender = genderData.gender;
    const gender_probability = genderData.probability;
    const sample_size = genderData.count;
    const age = agifyData.age;
    const age_group = classifyAge(age);

    // Pick country with highest probability
    const topCountry = nationalizeData.country.reduce((a, b) =>
      a.probability > b.probability ? a : b
    );
    const country_id = topCountry.country_id;
    const country_probability = topCountry.probability;

    // 6. Save to database
    const id = uuidv7();
    const result = await pool.query(
      `INSERT INTO profiles 
        (id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [id, cleanName, gender, gender_probability, sample_size, age, age_group, country_id, country_probability]
    );

    return res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// GET /api/profiles/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE id = $1', [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Profile not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// GET /api/profiles
router.get('/', async (req, res) => {
  const { gender, country_id, age_group } = req.query;

  try {
    let query = 'SELECT id, name, gender, age, age_group, country_id FROM profiles WHERE 1=1';
    const params = [];

    if (gender) {
      params.push(gender.toLowerCase());
      query += ` AND LOWER(gender) = $${params.length}`;
    }
    if (country_id) {
      params.push(country_id.toLowerCase());
      query += ` AND LOWER(country_id) = $${params.length}`;
    }
    if (age_group) {
      params.push(age_group.toLowerCase());
      query += ` AND LOWER(age_group) = $${params.length}`;
    }

    const result = await pool.query(query, params);

    return res.status(200).json({
      status: 'success',
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// DELETE /api/profiles/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM profiles WHERE id = $1 RETURNING id', [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Profile not found' });
    }

    return res.status(204).send();

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;