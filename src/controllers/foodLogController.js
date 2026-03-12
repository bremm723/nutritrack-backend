const pool = require('../config/db');

// GET /foodlogs?date=YYYY-MM-DD
exports.getFoodLogs = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `SELECT fl.id, fl.quantity, fl.date,
              f.id AS food_id, f.name, f.calories, f.protein, f.carbs, f.fat,
              ROUND(f.calories * fl.quantity, 1) AS total_calories
       FROM food_logs fl
       JOIN foods f ON f.id = fl.food_id
       WHERE fl.user_id = $1 AND fl.date = $2
       ORDER BY fl.created_at DESC`,
      [req.user.id, date]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get food logs error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /foodlogs
exports.createFoodLog = async (req, res) => {
  try {
    const { food_id, quantity, date } = req.body;

    if (!food_id || !quantity) {
      return res.status(400).json({ error: 'food_id and quantity are required.' });
    }

    const logDate = date || new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `INSERT INTO food_logs (user_id, food_id, quantity, date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, food_id, quantity, logDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create food log error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// DELETE /foodlogs/:id
exports.deleteFoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM food_logs WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Food log not found.' });
    }

    res.json({ message: 'Food log deleted successfully.' });
  } catch (err) {
    console.error('Delete food log error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
