const express = require('express');
const router = express.Router();
const { getTeams, getTeam, createTeam, updateTeam, deleteTeam, addMember, removeMember } = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(protect);

router.route('/')
  .get(getTeams)
  .post(authorize('org_admin', 'project_manager'), createTeam);

router.route('/:id')
  .get(getTeam)
  .put(authorize('org_admin', 'project_manager'), updateTeam)
  .delete(authorize('org_admin', 'project_manager'), deleteTeam);

router.post('/:id/members', authorize('org_admin', 'project_manager', 'team_lead'), addMember);
router.delete('/:id/members/:userId', authorize('org_admin', 'project_manager', 'team_lead'), removeMember);

module.exports = router;
