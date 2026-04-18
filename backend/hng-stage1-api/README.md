# HNG Stage 1 — Name Profile API

A RESTful API built with **Node.js + Express** that accepts a name, enriches it with data from 3 external APIs (gender, age, nationality), stores the result in a **PostgreSQL** database, and serves it through 4 clean endpoints.

**Live URL:** https://hng-stage1-api.up.railway.app

---

## What I Built & Learned

### The Big Picture
This API acts as a smart name research service:
1. A client sends a name
2. The API calls 3 external services simultaneously
3. It classifies and saves the result to a database
4. It serves that data back on demand — without repeating API calls for the same name

### Flow Diagram
```
Client → POST /api/profiles { "name": "yusuf" }
              │
              ▼
       Validate Input
              │
              ▼
    Check DB (duplicate?)──── Yes → Return existing profile
              │
             No
              │
              ▼
    Call 3 External APIs (in parallel)
    ┌─────────────────────────────────┐
    │ Genderize → gender + probability│
    │ Agify     → predicted age       │
    │ Nationalize → top country       │
    └─────────────────────────────────┘
              │
              ▼
    Classify age group (child/teenager/adult/senior)
              │
              ▼
    Save to PostgreSQL → Return 201 response
```

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js | Runtime |
| Express | Web framework / routing |
| PostgreSQL | Database (hosted on Railway) |
| `pg` | PostgreSQL client for Node.js |
| `axios` | HTTP calls to external APIs |
| `uuid` (v7) | Generates unique profile IDs |
| `dotenv` | Loads environment variables from `.env` |
| `cors` | Allows cross-origin requests |
| Railway | Cloud hosting (API + Database) |

---

## Project Structure

```
hng-stage1-api/
│
├── index.js          ← App entry point, starts the Express server
├── db.js             ← PostgreSQL connection pool
├── migrate.js        ← One-time script to create the profiles table
├── Procfile          ← Tells Railway how to start the app
├── .env              ← Secret config (DATABASE_URL, PORT) — not committed
├── .gitignore        ← Excludes node_modules and .env from Git
│
└── routes/
    └── profiles.js   ← All 4 API endpoints live here
```

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id                  TEXT PRIMARY KEY,
  name                TEXT UNIQUE NOT NULL,
  gender              TEXT,
  gender_probability  NUMERIC,
  sample_size         INTEGER,
  age                 INTEGER,
  age_group           TEXT,
  country_id          TEXT,
  country_probability NUMERIC,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### Age Group Classification Logic
| Age Range | Group |
|-----------|-------|
| 0 – 12 | `child` |
| 13 – 19 | `teenager` |
| 20 – 59 | `adult` |
| 60+ | `senior` |

---

## API Endpoints

### 1. `POST /api/profiles`
Creates a new profile by calling 3 external APIs.

**Request:**
```json
{ "name": "yusuf" }
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "019da02f-b14d-71ea-a6a4-93f717c34389",
    "name": "yusuf",
    "gender": "male",
    "gender_probability": "0.98",
    "sample_size": 298522,
    "age": 50,
    "age_group": "adult",
    "country_id": "NG",
    "country_probability": "0.18",
    "created_at": "2026-04-18T10:42:51.170Z"
  }
}
```

**If name already exists (200):**
```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { ... }
}
```

---

### 2. `GET /api/profiles`
Returns all profiles. Supports optional query filters.

**Filters:**
```
GET /api/profiles?gender=female
GET /api/profiles?country_id=NG
GET /api/profiles?age_group=adult
GET /api/profiles?gender=male&country_id=NG
```

**Response (200):**
```json
{
  "status": "success",
  "count": 5,
  "data": [ ... ]
}
```

---

### 3. `GET /api/profiles/:id`
Returns a single profile by its UUID.

**Response (200):**
```json
{
  "status": "success",
  "data": { ... }
}
```

**If not found (404):**
```json
{ "status": "error", "message": "Profile not found" }
```

---

### 4. `DELETE /api/profiles/:id`
Deletes a profile by its UUID.

- **Success:** `204 No Content`
- **Not found:** `404 { "status": "error", "message": "Profile not found" }`

---

## Error Handling

| Status | Meaning |
|--------|---------|
| `400` | Missing or empty `name` field |
| `404` | Profile ID does not exist |
| `422` | Invalid data type sent |
| `500` | Internal server error |
| `502` | External API returned invalid response |

---

## External APIs Used

| API | Endpoint | What it returns |
|-----|----------|----------------|
| [Genderize.io](https://genderize.io) | `GET https://api.genderize.io?name={name}` | gender + probability + sample size |
| [Agify.io](https://agify.io) | `GET https://api.agify.io?name={name}` | predicted age |
| [Nationalize.io](https://nationalize.io) | `GET https://api.nationalize.io?name={name}` | list of countries with probabilities |

All 3 are called **in parallel** using `Promise.all()` for speed.

---

## Key Concepts I Learned

### 1. REST API Design
Building clean, predictable endpoints using HTTP methods (`GET`, `POST`, `DELETE`) and correct status codes (`200`, `201`, `204`, `400`, `404`).

### 2. Database Integration
Connecting Node.js to PostgreSQL using a connection pool (`pg`), writing parameterized queries (`$1`, `$2`) to prevent SQL injection, and running migrations to set up the schema.

### 3. Parallel API Calls
Using `Promise.all()` to call 3 APIs at the same time instead of waiting for each one — making the endpoint significantly faster.

### 4. Deduplication Logic
Checking if a profile already exists before hitting external APIs — saves API quota and speeds up repeat lookups.

### 5. Environment Variables
Storing secrets like `DATABASE_URL` in a `.env` file and loading them with `dotenv` — never hardcoding credentials in code.

### 6. Cloud Deployment
Deploying a Node.js + PostgreSQL app to Railway, linking environment variables between services, and generating a public live URL.

### 7. Error Handling
Returning structured JSON error responses instead of crashing — covering input validation, missing resources, and external API failures.

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/yusuuf-mm/hng-internship-workspace.git
cd hng-internship-workspace/backend/hng-stage1-api

# 2. Install dependencies
npm install

# 3. Create .env file
echo "DATABASE_URL=your_postgres_url_here" > .env
echo "PORT=3000" >> .env

# 4. Create database table
node migrate.js

# 5. Start the server
node index.js
```

Server runs at: `http://localhost:3000`

---

## Deployment

Hosted on [Railway](https://railway.app):
- **API Service** → Node.js app auto-deployed from GitHub
- **Postgres Service** → Managed PostgreSQL database
- `DATABASE_URL` is linked internally between both services

---

## Related Stages

| Stage | Repo Path | Description |
|-------|-----------|-------------|
| Stage 0 | `backend/hng-stage0-api` | Simple info endpoint |
| Stage 1 | `backend/hng-stage1-api` | This project — Name Profile API |