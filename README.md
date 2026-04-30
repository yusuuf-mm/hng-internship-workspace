# HNG Stage 3 — Insighta Labs+ Backend API

A secure, production-grade backend system that extends the Stage 2 Intelligence Query Engine with authentication, role-based access control (RBAC), and multi-interface support (REST API, CLI, Web).

It enables intelligent demographic querying with natural language search, filtering, sorting, pagination, and secure access control using GitHub OAuth and JWT.

---

## 🚀 Live API

Base URL:
https://hng-stage3-api.up.railway.app

---

## 🧠 System Overview

A modular backend architecture designed for scalability, security, and extensibility.

### Core Components

**1. API Layer (Express.js)**
- Authentication (GitHub OAuth)
- Profile management (CRUD)
- Search, filter, sort, pagination
- CSV export

**2. Database (PostgreSQL)**
- User accounts (OAuth-based)
- 2026 seeded demographic dataset
- Indexed profile storage

**3. Authentication**
- GitHub OAuth (code exchange flow)
- JWT-based session management
- Secure token verification middleware

**4. Interfaces**
- REST API (primary)
- CLI client (external integration)
- Web dashboard (consumer-facing)

---

## 🔐 Authentication Flow

### 1. Initiate Login
```

GET /api/auth/github

```

### 2. OAuth Callback
```

GET /api/auth/github/callback

```

### 3. Token Issuance Flow
- Exchange OAuth code for GitHub token
- Fetch GitHub user profile
- Create/update user in DB
- Issue signed JWT

### 4. Accessing Protected Routes
```

Authorization: Bearer <JWT_TOKEN>

```

---

## 🧾 Role-Based Access Control (RBAC)

### Admin
- Full system access
- Delete profiles
- Export CSV data
- Manage system operations

### Analyst
- Read-only access to profiles
- Search and filter data
- No destructive operations

### Middleware
- `authenticate` → verifies JWT
- `authorize(role)` → enforces permissions

---

## 📊 API Endpoints

### Get Profiles
```

GET /api/profiles

```

Supports:
- Filtering
- Sorting
- Pagination

Example:
```

/api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10

```

---

### Natural Language Search
```

GET /api/profiles/search?q=

```

Example:
```

/api/profiles/search?q=young males from nigeria

```

#### Parsing Rules

| Input         | Meaning                     |
|--------------|----------------------------|
| young         | age 16–24                  |
| males         | gender = male              |
| females       | gender = female            |
| adults        | age_group = adult          |
| teenagers     | age_group = teenager       |
| seniors       | age_group = senior         |
| from nigeria  | country_id = NG            |

Example interpretation:
- "young males from nigeria"
→ gender=male, age 16–24, country=NG

---

### Get Profile by ID
```

GET /api/profiles/:id

```

---

### Create Profile
```

POST /api/profiles

```

Uses external enrichment APIs:
- Genderize
- Agify
- Nationalize

---

### Delete Profile (Admin only)
```

DELETE /api/profiles/:id

```

---

### Export CSV (Admin only)
```

GET /api/profiles/export/csv

```

---

## ⚙️ Data Model

### Profiles Table
- id (UUID v7)
- name (unique)
- gender
- gender_probability
- age
- age_group
- country_id
- country_name
- country_probability
- created_at

---

## 🔍 Natural Language Processing Engine

Rule-based parser (no LLMs).

### Pipeline
```

input → normalize → regex extraction → filter object → SQL builder

````

### Supported Logic

**Gender**
- male, men, boys → male
- female, women, girls → female

**Age**
- above X → min_age
- below X → max_age
- between X and Y → range
- young → 16–24

**Country**
- “from Nigeria”, “in Kenya” → ISO mapping

---

## ⚠️ Limitations

### NLP
- No typo correction
- No negation handling (e.g. “not from Nigeria”)
- Single-country queries only
- Ambiguous queries may fail gracefully

### System
- No caching layer
- Basic rate limiting (if enabled)
- No advanced query planner optimization

---

## 🔐 Security

- JWT authentication
- HTTP-only protected routes
- RBAC enforcement
- Environment variable protection
- CORS enabled

---

## 🚦 Error Format

```json
{
  "status": "error",
  "message": "Description here"
}
````

### Common Status Codes

* 400 → Bad request
* 401 → Unauthorized
* 403 → Forbidden
* 404 → Not found
* 422 → Validation error
* 500 → Server error

---

## 📈 Performance Notes

* Indexed UUID lookups
* Parameterized SQL queries (injection-safe)
* Pagination enforced (max 50 records per request)

---

## 🧪 Testing Strategy

* Postman / curl API validation
* OAuth flow verification
* RBAC role simulation
* Seeded dataset consistency checks

---

## 📦 Deployment

* Hosted on Railway
* PostgreSQL managed database
* Auto-deploy via GitHub main branch

---

## 📤 Submission Checklist

* Backend deployed ✔
* GitHub repo connected ✔
* OAuth working ✔
* RBAC enforced ✔
* NLP search functional ✔
* CSV export working ✔
* Documentation complete ✔

---

## 🧠 Summary

This project demonstrates:

* Secure OAuth + JWT authentication
* Scalable backend architecture
* Role-based access control
* Rule-based NLP query parsing
* Production-ready API design principles

```
```

