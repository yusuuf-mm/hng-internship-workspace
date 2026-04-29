require('dotenv').config();

const authRoutes = require("./routes/auth");
const express = require('express');
const cors = require('cors');
const profileRoutes = require('./routes/profiles');

const app = express();
const apiLimiter = require("./middleware/rateLimit");
const logger = require("./middleware/logger");

app.use(logger);
app.use(apiLimiter);

app.use(cors());
app.use(express.json());

app.use('/api/profiles', profileRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
