const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { analyzeFood, logDetectedFood } = require('../controllers/aiController');

router.post('/analyze-food', authenticate, analyzeFood);
router.post('/log-detected-food', authenticate, logDetectedFood);

module.exports = router;