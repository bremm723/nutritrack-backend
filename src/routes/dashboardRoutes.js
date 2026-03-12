const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getSummary, getWeeklyProgress } = require('../controllers/dashboardController');

router.get('/summary',          auth, getSummary);
router.get('/weekly-progress',  auth, getWeeklyProgress);

module.exports = router;
