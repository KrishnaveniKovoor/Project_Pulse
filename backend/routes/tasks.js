const express = require('express');
const router = express.Router();
const { getTasks, getTask, createTask, updateTask, deleteTask, updateTaskStatus, getKanbanTasks, assignTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.get('/kanban', getKanbanTasks);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.put('/:id/status', updateTaskStatus);
router.put('/:id/assign', assignTask);

module.exports = router;
