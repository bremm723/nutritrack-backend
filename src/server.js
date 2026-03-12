const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/authRoutes');
const userRoutes      = require('./routes/userRoutes');
const foodRoutes      = require('./routes/foodRoutes');
const foodLogRoutes   = require('./routes/foodLogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- Routes ---------------
app.use('/auth',      authRoutes);
app.use('/user',      userRoutes);
app.use('/foods',     foodRoutes);
app.use('/foodlogs',  foodLogRoutes);
app.use('/dashboard', dashboardRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'NutriTrack API is running 🚀' });
});

// --------------- Global Error Handler ---------------
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// --------------- Start Server ---------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  NutriTrack API running on port ${PORT}`);
});

module.exports = app;
