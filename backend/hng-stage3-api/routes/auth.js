const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const pool = require("../db"); // IMPORTANT: needed for user count check
const { findUserByGithubId, createUser } = require("../db/user.model");

const router = express.Router();

/**
 * STEP 1: Redirect user to GitHub OAuth
 */
router.get("/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  const redirectUrl =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${clientId}` +
    "&scope=read:user user:email";

  res.redirect(redirectUrl);
});

/**
 * STEP 2: GitHub OAuth callback
 */
router.get("/github/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({
      status: "error",
      message: "Missing code from GitHub",
    });
  }

  try {
    // exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

    // fetch GitHub user
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const ghUser = userResponse.data;

    // check if user exists
    let user = await findUserByGithubId(ghUser.id);

    // 👇 FIRST USER = ADMIN LOGIC
    if (!user) {
      const countResult = await pool.query("SELECT COUNT(*) FROM users");
      const isFirstUser = parseInt(countResult.rows[0].count) === 0;

      user = await createUser({
        github_id: ghUser.id,
        username: ghUser.login,
        name: ghUser.name,
        avatar: ghUser.avatar_url,
        role: isFirstUser ? "admin" : "analyst",
      });
    }

    // create JWT
    const token = jwt.sign(
      {
        id: user.id,
        github_id: user.github_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      status: "success",
      token,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

module.exports = router;
