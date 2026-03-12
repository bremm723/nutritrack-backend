const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllFoods,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');

router.get('/',      auth, getAllFoods);
router.post('/',     auth, createFood);
router.put('/:id',   auth, updateFood);
router.delete('/:id', auth, deleteFood);

module.exports = router;
