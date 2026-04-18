const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

// Your API key — keep this secret but consistent
const API_KEY = 'my-secret-api-key-2024';

// Auth middleware — checks every request for a valid key
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing API key' });
  }
  next();
}

// Apply auth to all routes
app.use(requireApiKey);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.get('/health', (req, res) => {
  const used = process.memoryUsage();
  const memoryMB = (used.rss / 1024 / 1024).toFixed(1);
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
    github: 'https://github.com/yusuuf-mm/stage1-myapi',
    repo: 'stage1-myapi'
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`API running on http://localhost:${PORT}`);
});