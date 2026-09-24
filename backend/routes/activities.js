const express = require('express');
const router = express.Router();
const { getActivities, getUserActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getActivities);
router.get('/user', getUserActivities);

module.exports = router;
