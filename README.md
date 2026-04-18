# Stage 1 — Personal API

## Overview

A personal REST API built with Node.js and Express, deployed on an AWS EC2 server with Nginx as a reverse proxy and pm2 as the process manager. All endpoints are served over HTTPS.

## Tech Stack

| Layer | Tool |
|-------|------|
| Runtime | Node.js v20 |
| Framework | Express |
| Process Manager | pm2 |
| Reverse Proxy | Nginx |
| SSL | Let's Encrypt (Certbot) |
| Cloud | AWS EC2 (Ubuntu) |

## Run Locally

```bash
# Clone the repo
git clone https://github.com/yusuuf-mm/hng-internship-workspace.git
cd hng-internship-workspace/devops/stage1-myapi

# Install dependencies
npm install

# Start the server
node index.js
```

The API will run at `http://localhost:3000`

## Authentication

All endpoints require an API key. Pass it as a request header:

```
x-api-key: your-api-key
```

Requests without a valid key will receive a `401 Unauthorized` response.

## Endpoints

### `GET /`
Returns a confirmation that the API is running.

```bash
curl -H "x-api-key: your-api-key" https://yusuufmm.duckdns.org/
```

Response:
```json
{
  "message": "API is running"
}
```

---

### `GET /health`
Returns the health status of the API including CPU and memory usage.

```bash
curl -H "x-api-key: your-api-key" https://yusuufmm.duckdns.org/health
```

Response:
```json
{
  "message": "healthy",
  "cpu": "2.5%",
  "memory": "45.2MB"
}
```

---

### `GET /me`
Returns personal details of the developer.

```bash
curl -H "x-api-key: your-api-key" https://yusuufmm.duckdns.org/me
```

Response:
```json
{
  "name": "Yusuf Muhammad Musa",
  "email": "yusuf2000mm@gmail.com",
  "github": "https://github.com/yusuuf-mm/stage1-myapi",
  "repo": "stage1-myapi"
}
```

---

### Unauthorized request (no key)

```bash
curl https://yusuufmm.duckdns.org/
```

Response (`401`):
```json
{
  "error": "Unauthorized: invalid or missing API key"
}
```

## Deployment Architecture

```
Internet (HTTPS)
      │
      ▼
  Nginx :443
  (reverse proxy)
      │
      ▼
  Node.js :3000
  (managed by pm2)
```

- App runs on `127.0.0.1:3000` — not exposed publicly
- Nginx proxies all public traffic to the app
- pm2 keeps the app running and restarts it automatically on server reboot

## Live URL

https://yusuufmm.duckdns.org

## Author

- **Name:** Yusuf Muhammad Musa
- **Email:** yusuf2000mm@gmail.com
- **GitHub:** https://github.com/yusuuf-mm
