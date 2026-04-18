const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

const API_KEY = 'my-secret-api-key-2024';

function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (!key || key !== API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
  }
  next();
}

// Public endpoints — no auth required
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.get('/health', (req, res) => {
  const memoryMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
  const cpuUsage = (os.loadavg()[0] * 100 / os.cpus().length).toFixed(1);
  res.status(200).json({
    message: 'healthy',
    cpu: `${cpuUsage}%`,
    memory: `${memoryMB}MB`
  });
});

app.get('/me', (req, res) => {
  res.status(200).json({
    name: 'Yusuf Muhammad Musa',
    email: 'yusuf2000mm@gmail.com',
    github: 'https://github.com/yusuuf-mm/hng-internship-workspace',
    repo: 'hng-internship-workspace'
  });
});

// Protected endpoint — auth required
app.get('/secure', requireApiKey, (req, res) => {
  res.status(200).json({ message: 'Authorized access' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`API running on http://localhost:${PORT}`);
});