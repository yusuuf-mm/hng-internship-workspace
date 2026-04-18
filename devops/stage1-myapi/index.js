const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'healthy' });
});

app.get('/me', (req, res) => {
  res.status(200).json({
    name: 'Yusuf Muhammad Musa',
    email: 'yusuf2000mm@gmail.com',
    github: 'https://github.com/yusuuf-mm'
  });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});