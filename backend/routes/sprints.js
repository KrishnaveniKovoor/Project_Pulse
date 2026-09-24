const express = require('express');
const router = express.Router();
const { getSprints, getSprint, createSprint, updateSprint, deleteSprint, startSprint, completeSprint, addTaskToSprint, removeTaskFromSprint } = require('../controllers/sprintController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSprints)
  .post(createSprint);

router.route('/:id')
  .get(getSprint)
  .put(updateSprint)
  .delete(deleteSprint);

router.put('/:id/start', startSprint);
router.put('/:id/complete', completeSprint);

router.post('/:id/tasks/:taskId', addTaskToSprint); // alternative approach
router.post('/:id/tasks', addTaskToSprint); // expecting taskId in body
router.delete('/:id/tasks/:taskId', removeTaskFromSprint);

module.exports = router;
