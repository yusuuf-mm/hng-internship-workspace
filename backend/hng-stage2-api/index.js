require('dotenv').config();
const express = require('express');
const cors = require('cors');
const profileRoutes = require('./routes/profiles');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/profiles', profileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});