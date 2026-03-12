const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');

router.get('/profile',  auth, getProfile);
router.put('/profile',  auth, updateProfile);

module.exports = router;
