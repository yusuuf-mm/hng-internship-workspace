const pool = require("../db");

async function findUserByGithubId(github_id) {
  const result = await pool.query(
    "SELECT * FROM users WHERE github_id = $1",
    [github_id]
  );
  return result.rows[0];
}

async function createUser({ github_id, username, name, avatar, role }) {
  const result = await pool.query(
    `INSERT INTO users (github_id, username, name, avatar, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [github_id, username, name, avatar, role]
  );

  return result.rows[0];
}

module.exports = {
  findUserByGithubId,
  createUser,
};
