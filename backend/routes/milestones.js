const express = require('express');
const router = express.Router();
const { getMilestones, getMilestone, createMilestone, updateMilestone, deleteMilestone } = require('../controllers/milestoneController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getMilestones)
  .post(createMilestone);

router.route('/:id')
  .get(getMilestone)
  .put(updateMilestone)
  .delete(deleteMilestone);

module.exports = router;
