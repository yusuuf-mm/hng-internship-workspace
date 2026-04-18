# Stage 1 API — HNG DevOps Track

A personal REST API built with Node.js and Express, deployed on an AWS EC2 server with Nginx as a reverse proxy.

## Run locally

```bash
npm install
node index.js
```

## Endpoints

| Endpoint  | Method | Response                                        |
|-----------|--------|-------------------------------------------------|
| /         | GET    | {"message": "API is running"}                   |
| /health   | GET    | {"message": "healthy"}                          |
| /me       | GET    | {"name": "...", "email": "...", "github": "..."} |

## Live URL

https://yusuufmm.duckdns.org