const pool = require('../config/db');
const { calculateTDEE } = require('../services/calorieService');

// GET /dashboard/summary?date=YYYY-MM-DD
exports.getSummary = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const userResult = await pool.query(
      'SELECT age, height, weight, gender, activity_level FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const profile = userResult.rows[0];

    if (!profile.age || !profile.height || !profile.weight || !profile.gender) {
      return res.status(400).json({
        error: 'Please complete your profile (age, height, weight, gender) to see calorie targets.',
      });
    }

    const targetCalories = calculateTDEE(profile);

    const logResult = await pool.query(
      `SELECT COALESCE(SUM(f.calories * fl.quantity), 0) AS consumed
       FROM food_logs fl
       JOIN foods f ON f.id = fl.food_id
       WHERE fl.user_id = $1 AND fl.date = $2`,
      [req.user.id, date]
    );

    const consumedCalories = Math.round(Number(logResult.rows[0].consumed));
    const remainingCalories = targetCalories - consumedCalories;

    res.json({ targetCalories, consumedCalories, remainingCalories });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /dashboard/weekly-progress
exports.getWeeklyProgress = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.date,
              COALESCE(SUM(f.calories * fl.quantity), 0) AS calories
       FROM generate_series(
              CURRENT_DATE - INTERVAL '6 days',
              CURRENT_DATE,
              '1 day'::interval
            ) AS d(date)
       LEFT JOIN food_logs fl
         ON fl.date = d.date::date AND fl.user_id = $1
       LEFT JOIN foods f ON f.id = fl.food_id
       GROUP BY d.date
       ORDER BY d.date ASC`,
      [req.user.id]
    );

    const data = result.rows.map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      calories: Math.round(Number(row.calories)),
    }));

    res.json(data);
  } catch (err) {
    console.error('Weekly progress error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};