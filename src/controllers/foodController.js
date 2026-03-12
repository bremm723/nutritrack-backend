const pool = require('../config/db');

// GET /foods
exports.getAllFoods = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM foods ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get foods error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /foods
exports.createFood = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat } = req.body;

    if (!name || calories == null) {
      return res.status(400).json({ error: 'Name and calories are required.' });
    }

    const result = await pool.query(
      `INSERT INTO foods (name, calories, protein, carbs, fat)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, calories, protein || 0, carbs || 0, fat || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create food error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// PUT /foods/:id
exports.updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, calories, protein, carbs, fat } = req.body;

    const result = await pool.query(
      `UPDATE foods
       SET name     = COALESCE($1, name),
           calories = COALESCE($2, calories),
           protein  = COALESCE($3, protein),
           carbs    = COALESCE($4, carbs),
           fat      = COALESCE($5, fat)
       WHERE id = $6
       RETURNING *`,
      [name, calories, protein, carbs, fat, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Food not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update food error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// DELETE /foods/:id
exports.deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM foods WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Food not found.' });
    }

    res.json({ message: 'Food deleted successfully.' });
  } catch (err) {
    console.error('Delete food error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
