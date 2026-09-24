const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember, getProjectStats, getProjectActivity } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('org_admin', 'project_manager'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('org_admin', 'project_manager'), updateProject)
  .delete(authorize('org_admin', 'project_manager'), deleteProject);

router.post('/:id/members', authorize('org_admin', 'project_manager'), addMember);
router.delete('/:id/members/:userId', authorize('org_admin', 'project_manager'), removeMember);

router.get('/:id/stats', getProjectStats);
router.get('/:id/activity', getProjectActivity);

module.exports = router;
