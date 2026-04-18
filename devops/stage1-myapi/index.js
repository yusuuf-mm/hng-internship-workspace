const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.get('/health', (req, res) => {
  const memoryMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
  const cpuLoad = (os.loadavg()[0] * 100 / os.cpus().length).toFixed(1);
  res.status(200).json({
    message: 'healthy',
    cpu: `${cpuLoad}%`,
    memory: `${memoryMB}MB`
  });
});

app.get('/me', (req, res) => {
  res.status(200).json({
    name: 'Yusuf Muhammad Musa',
    email: 'yusuf2000mm@gmail.com',
    github: 'https://github.com/yusuuf-mm',
    repo_name: 'hng-internship-workspace'
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`API running on http://localhost:${PORT}`);
});