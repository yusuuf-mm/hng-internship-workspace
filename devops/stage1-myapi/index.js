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
    name: 'Your Full Name',       // <-- your real name
    email: 'you@example.com',    // <-- your real email
    github: 'https://github.com/yourusername'  // <-- your real GitHub
  });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});