const express = require('express');
const axios = require('axios');
const { v7: uuidv7 } = require('uuid');
const { authenticate, authorize } = require("../middleware/auth.middleware");
const router = express.Router();
const pool = require('../db');
const { Parser } = require("json2csv");

/* =======================
   Helpers
======================= */

function classifyAge(age) {
  if (age <= 12) return 'child';
  if (age <= 19) return 'teenager';
  if (age <= 59) return 'adult';
  return 'senior';
}

function getPagination(page, limit) {
  const pageNum = parseInt(page) || 1;
  const limitNum = Math.min(parseInt(limit) || 10, 50);
  const offset = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, offset };
}

/* =======================
   ROUTES (ALL PROTECTED)
======================= */

/**
 * CREATE PROFILE
 * POST /
 * (you can decide later if this should be admin-only)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'Missing or invalid name' });
    }

    const cleanName = name.trim().toLowerCase();

    const existing = await pool.query(
      'SELECT * FROM profiles WHERE name = $1',
      [cleanName]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({
        status: 'success',
        message: 'Profile already exists',
        data: existing.rows[0]
      });
    }

    const [genderRes, ageRes, countryRes] = await Promise.all([
      axios.get(`https://api.genderize.io?name=${cleanName}`),
      axios.get(`https://api.agify.io?name=${cleanName}`),
      axios.get(`https://api.nationalize.io?name=${cleanName}`)
    ]);

    const genderData = genderRes.data;
    const ageData = ageRes.data;
    const countryData = countryRes.data;

    if (!genderData.gender || genderData.count === 0) {
      return res.status(502).json({ status: 'error', message: 'Invalid gender data' });
    }

    if (!ageData.age) {
      return res.status(502).json({ status: 'error', message: 'Invalid age data' });
    }

    if (!countryData.country?.length) {
      return res.status(502).json({ status: 'error', message: 'Invalid country data' });
    }

    const topCountry = countryData.country.reduce((a, b) =>
      a.probability > b.probability ? a : b
    );

    const profile = {
      id: uuidv7(),
      name: cleanName,
      gender: genderData.gender,
      gender_probability: genderData.probability,
      sample_size: genderData.count,
      age: ageData.age,
      age_group: classifyAge(ageData.age),
      country_id: topCountry.country_id,
      country_probability: topCountry.probability
    };

    const result = await pool.query(
      `INSERT INTO profiles
       (id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      Object.values(profile)
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

/**
 * SEARCH
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, page, limit } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ status: 'error', message: 'Missing query' });
    }

    const query = q.toLowerCase();
    const filters = {};

    if (/\bmales?\b/.test(query)) filters.gender = 'male';
    else if (/\bfemales?\b|\bwomen\b/.test(query)) filters.gender = 'female';

    if (/\bchild|kids?\b/.test(query)) filters.age_group = 'child';
    else if (/\bteens?\b/.test(query)) filters.age_group = 'teenager';
    else if (/\badults?\b/.test(query)) filters.age_group = 'adult';
    else if (/\bseniors?|elderly\b/.test(query)) filters.age_group = 'senior';

    const above = query.match(/(?:above|over|older than)\s+(\d+)/);
    if (above) filters.min_age = parseInt(above[1]);

    const below = query.match(/(?:below|under|younger than)\s+(\d+)/);
    if (below) filters.max_age = parseInt(below[1]);

    const between = query.match(/between\s+(\d+)\s+and\s+(\d+)/);
    if (between) {
      filters.min_age = parseInt(between[1]);
      filters.max_age = parseInt(between[2]);
    }

    if (/\byoung\b/.test(query)) {
      filters.min_age = 16;
      filters.max_age = 24;
    }

    const countryMap = {
      nigeria: 'NG', ghana: 'GH', kenya: 'KE', ethiopia: 'ET',
      tanzania: 'TZ', uganda: 'UG', 'south africa': 'ZA', angola: 'AO',
      senegal: 'SN', mali: 'ML', cameroon: 'CM', 'ivory coast': 'CI',
      zambia: 'ZM', zimbabwe: 'ZW', mozambique: 'MZ', somalia: 'SO',
      sudan: 'SD', morocco: 'MA', egypt: 'EG', algeria: 'DZ',
      tunisia: 'TN', benin: 'BJ', togo: 'TG', india: 'IN',
      pakistan: 'PK', china: 'CN', 'united kingdom': 'GB', uk: 'GB',
      'united states': 'US', usa: 'US', france: 'FR', germany: 'DE',
      congo: 'CD', drc: 'CD', rwanda: 'RW', burundi: 'BI',
      malawi: 'MW', botswana: 'BW', namibia: 'NA', gabon: 'GA',
      madagascar: 'MG', niger: 'NE', chad: 'TD', libya: 'LY'
    };

    const fromMatch = query.match(/(?:from|in)\s+([a-z\s]+)/);
    if (fromMatch && countryMap[fromMatch[1].trim()]) {
      filters.country_id = countryMap[fromMatch[1].trim()];
    }

    if (!Object.keys(filters).length) {
      return res.status(400).json({
        status: 'error',
        message: 'Unable to interpret query'
      });
    }

    const { pageNum, limitNum, offset } = getPagination(page, limit);

    const conditions = [];
    const params = [];

    if (filters.gender) {
      params.push(filters.gender);
      conditions.push(`gender = $${params.length}`);
    }
    if (filters.age_group) {
      params.push(filters.age_group);
      conditions.push(`age_group = $${params.length}`);
    }
    if (filters.country_id) {
      params.push(filters.country_id);
      conditions.push(`country_id = $${params.length}`);
    }
	  A
    if (filters.min_age) {
      params.push(filters.min_age);
      conditions.push(`age >= $${params.length}`);
    }
    if (filters.max_age) {
      params.push(filters.max_age);
      conditions.push(`age <= $${params.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM profiles ${where}`, params
    );

    const result = await pool.query(
      `SELECT * FROM profiles ${where}
       ORDER BY created_at ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      status: 'success',
      page: pageNum,
      limit: limitNum,
      total: parseInt(countResult.rows[0].count),
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

/**
 * GET ALL PROFILES
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      gender, age_group, country_id,
      min_age, max_age,
      min_gender_probability, min_country_probability,
      sort_by = 'created_at',
      order = 'asc',
      page, limit
    } = req.query;

    const validSortFields = ['age', 'created_at', 'gender_probability'];
    const validOrders = ['asc', 'desc'];

    if (!validSortFields.includes(sort_by) || !validOrders.includes(order)) {
      return res.status(400).json({ status: 'error', message: 'Invalid query parameters' });
    }

    const { pageNum, limitNum, offset } = getPagination(page, limit);

    const conditions = [];
    const params = [];

    const add = (value, condition) => {
      params.push(value);
      conditions.push(`${condition} $${params.length}`);
    };

    if (gender) add(gender.toLowerCase(), 'LOWER(gender) =');
    if (age_group) add(age_group.toLowerCase(), 'LOWER(age_group) =');
    if (country_id) add(country_id.toUpperCase(), 'UPPER(country_id) =');
    if (min_age) add(parseInt(min_age), 'age >=');
    if (max_age) add(parseInt(max_age), 'age <=');

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM profiles ${where}`, params
    );

    const result = await pool.query(
      `SELECT * FROM profiles ${where}
       ORDER BY ${sort_by} ${order}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      status: 'success',
      page: pageNum,
      limit: limitNum,
      total: parseInt(countResult.rows[0].count),
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

/**
 * GET BY ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

/**
 * DELETE
 */
router.delete('/:id', authenticate, authorize("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM profiles WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    return res.status(204).send();

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

router.get("/export/csv", authenticate, authorize("admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profiles");

    const fields = [
      "id",
      "name",
      "gender",
      "gender_probability",
      "age",
      "age_group",
      "country_id",
      "country_name",
      "country_probability",
      "created_at"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header("Content-Type", "text/csv");
    res.attachment("profiles.csv");

    return res.send(csv);

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to export CSV"
    });
  }
});

module.exports = router;
