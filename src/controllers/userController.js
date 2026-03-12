const pool = require('../config/db');

// GET /user/profile
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, age, height, weight, gender, activity_level, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// PUT /user/profile
exports.updateProfile = async (req, res) => {
  try {
    const { age, height, weight, gender, activity_level } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET age = COALESCE($1, age),
           height = COALESCE($2, height),
           weight = COALESCE($3, weight),
           gender = COALESCE($4, gender),
           activity_level = COALESCE($5, activity_level)
       WHERE id = $6
       RETURNING id, email, age, height, weight, gender, activity_level`,
      [age, height, weight, gender, activity_level, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
