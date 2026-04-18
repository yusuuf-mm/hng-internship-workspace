const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

// Accepts ANY non-empty key
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.headers['authorization'] || req.query.api_key;
  if (!key) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
  }
  next();
}

// Public — no auth
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Protected — requires any non-empty key
app.get('/health', requireApiKey, (req, res) => {
  const memoryMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
  const cpuLoad = (os.loadavg()[0] * 100 / os.cpus().length).toFixed(1);
  res.status(200).json({
    message: 'healthy',
    cpu: `${cpuLoad}%`,
    memory: `${memoryMB}MB`
  });
});

app.get('/me', requireApiKey, (req, res) => {
  res.status(200).json({
    name: 'Yusuf Muhammad Musa',
    email: 'yusuf2000mm@gmail.com',
    github: 'https://github.com/yusuuf-mm/hng-internship-workspace',
    repo_name: 'hng-internship-workspace'
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`API running on http://localhost:${PORT}`);
});