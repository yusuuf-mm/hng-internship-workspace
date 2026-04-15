const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}); 

// routes

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/api/classify', async (req, res) => {
  const name = req.query.name;

  if (!name) {
    return res.status(400).json({
      status: "error",
      message: "Name parameter is required"
    });
  }

  if (typeof name !== 'string') {
    return res.status(422).json({
      status: "error",
      message: "Name must be a string"
    });
  }

  try {
    const response = await fetch(`https://api.genderize.io/?name=${name}`);
    const data = await response.json();
    const gender = data.gender;
    const probability = data.probability;
    const sample_size = data.count;
    const is_confident = probability >= 0.7 && sample_size >= 100;
    const processed_at = new Date().toISOString();

    if (gender === null || sample_size === 0) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    return res.json({
      status: "success",
      data: {
        name: data.name,
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(502).json({
      status: "error",
      message: "Upstream service failure"
    });
  }
});

// starting server

app.listen(3000, () => {
  console.log('Server running on port 3000');
});