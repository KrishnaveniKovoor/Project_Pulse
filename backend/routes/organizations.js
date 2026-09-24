const express = require('express');
const router = express.Router();
const { getOrganization, updateOrganization, addMember, removeMember, getOrgStats } = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(protect);

router.route('/current')
  .get(getOrganization)
  .put(authorize('org_admin'), updateOrganization);

router.get('/stats', authorize('org_admin'), getOrgStats);

router.post('/members', authorize('org_admin'), addMember);
router.delete('/members/:userId', authorize('org_admin'), removeMember);

module.exports = router;
