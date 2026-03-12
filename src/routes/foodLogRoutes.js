const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {
  getFoodLogs,
  createFoodLog,
  deleteFoodLog,
} = require('../controllers/foodLogController');

router.get('/',      auth, getFoodLogs);
router.post('/',     auth, createFoodLog);
router.delete('/:id', auth, deleteFoodLog);

module.exports = router;
