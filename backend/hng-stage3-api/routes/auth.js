const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * STEP 1: Redirect user to GitHub OAuth
 */
router.get("/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  const redirectUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=read:user user:email`;

  res.redirect(redirectUrl);
});
router.get("/github/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({
      status: "error",
      message: "Missing code from GitHub",
    });
  }

  try {
    // STEP 1: Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({
        status: "error",
        message: "Failed to get access token",
      });
    }

    // STEP 2: Fetch GitHub user
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = userResponse.data;

    // STEP 3: Return user info (temporary for now)
    return res.json({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        username: user.login,
        avatar: user.avatar_url,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "OAuth callback failed",
      error: error.message,
    });
  }
});

module.exports = router;
