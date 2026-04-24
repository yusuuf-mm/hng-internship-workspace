# HNG Stage 2 — Intelligence Query Engine

An upgraded demographic intelligence API built for **Insighta Labs**. Extends Stage 1 with advanced filtering, sorting, pagination, and a natural language search endpoint — all powered by **Node.js + Express + PostgreSQL**.

**Live URL:** https://hng-stage2-api.up.railway.app

---

## What's New in Stage 2

| Feature | Detail |
|---------|--------|
| Advanced filtering | 7 combinable filter params on `GET /api/profiles` |
| Sorting | Sort by `age`, `created_at`, or `gender_probability` |
| Pagination | `page` + `limit` (max 50) on all list endpoints |
| Natural language search | `GET /api/profiles/search?q=young males from nigeria` |
| `country_name` field | Full country name added to every profile |
| 2026 seeded profiles | Pre-loaded demographic dataset |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js + Express | Web framework |
| PostgreSQL | Database (hosted on Railway) |
| `pg` | PostgreSQL client |
| `uuid` v7 | Unique profile IDs |
| `dotenv` | Environment variable management |
| `cors` | Cross-origin access (`*`) |

---

## Project Structure

```
hng-stage2-api/
│
├── index.js            ← Entry point
├── db.js               ← PostgreSQL connection pool
├── migrate.js          ← Creates profiles table (fresh)
├── seed.js             ← Seeds 2026 profiles from JSON
├── seed_profiles.json  ← Source data (2026 profiles)
├── Procfile            ← Railway start command
├── .env                ← DATABASE_URL, PORT (not committed)
├── .gitignore
│
└── routes/
    └── profiles.js     ← All endpoints
```

---

## Database Schema

```sql
CREATE TABLE profiles (
  id                  TEXT PRIMARY KEY,
  name                VARCHAR UNIQUE NOT NULL,
  gender              VARCHAR,
  gender_probability  FLOAT,
  age                 INTEGER,
  age_group           VARCHAR,
  country_id          VARCHAR(2),
  country_name        VARCHAR,
  country_probability FLOAT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### 1. `GET /api/profiles`
Returns all profiles with optional filtering, sorting, and pagination.

**Supported filters:**

| Param | Example | Description |
|-------|---------|-------------|
| `gender` | `male` | Filter by gender |
| `age_group` | `adult` | child / teenager / adult / senior |
| `country_id` | `NG` | ISO country code |
| `min_age` | `25` | Minimum age (inclusive) |
| `max_age` | `40` | Maximum age (inclusive) |
| `min_gender_probability` | `0.8` | Minimum gender confidence |
| `min_country_probability` | `0.5` | Minimum country confidence |

**Sorting:**

| Param | Values |
|-------|--------|
| `sort_by` | `age`, `created_at`, `gender_probability` |
| `order` | `asc`, `desc` |

**Pagination:**

| Param | Default | Max |
|-------|---------|-----|
| `page` | `1` | — |
| `limit` | `10` | `50` |

**Example:**
```
GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10
```

**Response (200):**
```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "data": [...]
}
```

---

### 2. `GET /api/profiles/search`
Accepts a plain English query and converts it into database filters.

**Example:**
```
GET /api/profiles/search?q=young males from nigeria
```

**Response (200):**
```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 9,
  "data": [...]
}
```

**Uninterpretable query (400):**
```json
{ "status": "error", "message": "Unable to interpret query" }
```

---

### 3. `GET /api/profiles/:id`
Returns a single profile by UUID.

### 4. `POST /api/profiles`
Creates a new profile by calling Genderize, Agify, and Nationalize APIs.

### 5. `DELETE /api/profiles/:id`
Deletes a profile by UUID. Returns `204 No Content`.

---

## Natural Language Parsing — How It Works

The `/search` endpoint uses **pure rule-based regex parsing** — no AI, no LLMs. The query string is lowercased, then matched against a set of patterns to extract filters.

### Parsing Pipeline

```
Raw query → lowercase → regex pattern matching → filters object → SQL WHERE clause
```

### Supported Keywords & Mappings

#### Gender
| Keyword(s) | Maps to |
|-----------|---------|
| `male`, `males`, `men`, `man` | `gender = male` |
| `female`, `females`, `women`, `woman`, `girl`, `girls` | `gender = female` |

#### Age Group
| Keyword(s) | Maps to |
|-----------|---------|
| `child`, `children`, `kid`, `kids` | `age_group = child` |
| `teenager`, `teenagers`, `teen`, `teens` | `age_group = teenager` |
| `adult`, `adults` | `age_group = adult` |
| `senior`, `seniors`, `elderly`, `old people` | `age_group = senior` |

#### Special Age Mapping
| Keyword | Maps to |
|---------|---------|
| `young` | `min_age = 16, max_age = 24` (not a stored age group) |

#### Age Ranges
| Pattern | Maps to |
|---------|---------|
| `above X` / `over X` / `older than X` | `min_age = X` |
| `below X` / `under X` / `younger than X` | `max_age = X` |
| `between X and Y` | `min_age = X, max_age = Y` |

#### Country Detection
Pattern: `from <country>` or `in <country>`

| Country Name | ISO Code |
|-------------|---------|
| nigeria | NG |
| ghana | GH |
| kenya | KE |
| ethiopia | ET |
| tanzania | TZ |
| uganda | UG |
| south africa | ZA |
| angola | AO |
| senegal | SN |
| mali | ML |
| cameroon | CM |
| ivory coast | CI |
| zambia | ZM |
| zimbabwe | ZW |
| mozambique | MZ |
| somalia | SO |
| sudan | SD |
| morocco | MA |
| egypt | EG |
| algeria | DZ |
| tunisia | TN |
| benin | BJ |
| togo | TG |
| india | IN |
| pakistan | PK |
| china | CN |
| uk / united kingdom | GB |
| usa / united states | US |
| france | FR |
| germany | DE |
| congo / drc | CD |
| rwanda | RW |
| burundi | BI |
| malawi | MW |
| botswana | BW |
| namibia | NA |
| gabon | GA |
| madagascar | MG |
| niger | NE |
| chad | TD |
| libya | LY |

### Example Query Mappings

| Query | Parsed Filters |
|-------|---------------|
| `young males from nigeria` | `gender=male, min_age=16, max_age=24, country_id=NG` |
| `females above 30` | `gender=female, min_age=30` |
| `people from angola` | `country_id=AO` |
| `adult males from kenya` | `gender=male, age_group=adult, country_id=KE` |
| `male and female teenagers above 17` | `age_group=teenager, min_age=17` |
| `elderly women from ghana` | `gender=female, age_group=senior, country_id=GH` |
| `seniors between 65 and 80` | `age_group=senior, min_age=65, max_age=80` |

---

## Parser Limitations & Edge Cases

### What the parser does NOT handle:

1. **Unrecognized countries** — Only the 39 countries in the map are supported. Queries like `"people from cape verde"` will fail to extract a country filter.

2. **Compound gender queries** — `"male and female"` does not return both genders — only the first gender matched is applied.

3. **Negations** — `"not from nigeria"` or `"non-adults"` are not supported and will be ignored or misinterpreted.

4. **Relative terms without numbers** — `"very old people"` or `"quite young"` without a specific age number will not produce age range filters beyond what `young`/`elderly` already maps to.

5. **Typos and misspellings** — `"nigerria"` or `"femal"` will not be matched.

6. **Multiple countries** — `"people from nigeria and kenya"` only picks up the first country matched.

7. **Age-only queries** — `"people aged 25"` (exact age, not a range) is not supported.

8. **Ambiguous "in" preposition** — `"adults in their 30s"` will not be parsed correctly since `"in"` is used for country detection.

9. **Ordering/sorting** — Natural language queries cannot specify sort order (e.g., `"oldest males from ghana"` won't sort by age).

10. **Probability filters** — NLP queries cannot filter by `min_gender_probability` or `min_country_probability`.

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Missing/empty parameter or uninterpretable query |
| `404` | Profile not found |
| `422` | Invalid parameter type |
| `500` | Internal server error |
| `502` | External API failure (POST endpoint) |

---

## Running Locally

```bash
git clone https://github.com/yusuuf-mm/hng-internship-workspace.git
cd hng-internship-workspace/backend/hng-stage2-api
npm install

# Set up .env
echo "DATABASE_URL=your_public_postgres_url" > .env
echo "PORT=3000" >> .env

# Create table
node migrate.js

# Seed 2026 profiles
node seed.js

# Start server
node index.js
```

---

## Deployment

Hosted on [Railway](https://railway.app):
- **API Service** — Node.js, auto-deployed from GitHub
- **Postgres Service** — Shared with Stage 1, same database
- `DATABASE_URL` linked internally between services

---

## Related Stages

| Stage | Path | Description |
|-------|------|-------------|
| Stage 0 | `backend/hng-stage0-api` | Static info endpoint |
| Stage 1 | `backend/hng-stage1-api` | Name Profile API |
| Stage 2 | `backend/hng-stage2-api` | Intelligence Query Engine |