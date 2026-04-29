# Insighta Labs+ — Profile Intelligence System (Stage 3)

## Overview

This is a demographic intelligence API built for Insighta Labs.

It provides:
- Advanced filtering and sorting of profile data
- Natural language search parsing (rule-based)
- GitHub OAuth authentication
- JWT-based session management
- Role-based access control (admin / analyst)
- CSV export for administrative use
- Rate limiting and request logging

The system is built using Node.js, Express, and PostgreSQL.

---

## System Architecture

The system is structured into four main layers:

### 1. Backend API (Express)
Handles all HTTP requests, authentication, business logic, and data processing.

### 2. Database (PostgreSQL)
Stores:
- User profiles (2026 dataset)
- Auth users and roles

### 3. Authentication Layer
- GitHub OAuth login
- JWT token generation for session management
- Stateless authentication model

### 4. Middleware Layer
- Role-Based Access Control (RBAC)
- Rate limiting (security protection)
- Request logging (system monitoring)

---

## Authentication Flow

1. User initiates login via GitHub OAuth
2. GitHub redirects back with authorization code
3. Backend exchanges code for access token
4. Backend fetches GitHub user profile
5. User is created or retrieved from database
6. JWT token is generated containing:
   - user id
   - github_id
   - role
7. Token is used for all protected routes via Authorization header

---

## Role-Based Access Control (RBAC)

Two roles exist:

### Admin
- Full access to all endpoints
- Can delete profiles
- Can export CSV data

### Analyst
- Can view and search profiles
- Cannot delete or export data

Access is enforced using middleware that checks JWT role claims.

---

## Natural Language Parsing

The `/api/profiles/search` endpoint uses rule-based parsing (no AI/LLM).

### Approach:
- Convert query to lowercase
- Apply regex patterns
- Map keywords to structured filters

### Examples:

- "young males from nigeria"
  → gender=male, age 16–24, country=NG

- "females above 30"
  → gender=female, min_age=30

- "adult males from kenya"
  → gender=male, age_group=adult, country=KE

### Limitations:
- No AI or semantic understanding
- Limited country dictionary
- Cannot handle complex negations
- Cannot process ambiguous phrases reliably

---

## Limitations

- Rule-based NLP only (no machine learning)
- No fuzzy matching for typos
- Country mapping is predefined and limited
- Complex sentence structures are not supported
- No contextual understanding of queries

---

## API Endpoints

### Authentication
- GET /api/auth/github
- GET /api/auth/github/callback

### Profiles
- GET /api/profiles (protected)
- GET /api/profiles/search?q=
- GET /api/profiles/:id
- DELETE /api/profiles/:id (admin only)
- GET /api/profiles/export/csv (admin only)

---

## Security Features

- JWT authentication
- Role-based authorization
- Rate limiting (anti-abuse protection)
- Request logging for monitoring

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JSON Web Token (JWT)
- GitHub OAuth
- json2csv

---

## Notes

- All timestamps are in UTC (ISO 8601 format)
- UUID v7 used for profile IDs
- All filters are combinable
- API is designed for production-like usage patterns
