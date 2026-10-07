const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, getUserActivity } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(protect);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(authorize('org_admin'), updateUser);

router.get('/:id/activity', getUserActivity);

module.exports = router;
