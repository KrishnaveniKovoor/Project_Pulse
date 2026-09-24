const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityHelper');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getTasks = async (req, res, next) => {
  try {
    const { project, projectId, sprint, assignee, status, priority, search, page = 1, limit = 10 } = req.query;
    const query = { isArchived: false };
    const targetProject = project || projectId;
    if (targetProject) query.project = targetProject;
    if (sprint) query.sprint = sprint;
    if (assignee) query.assignee = assignee;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tasks = await Task.find(query).skip(skip).limit(parseInt(limit)).populate('assignee', 'name avatar').populate('project', 'name').sort('order');
    const total = await Task.countDocuments(query);

    res.status(200).json({ success: true, count: tasks.length, total, data: tasks });
  } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignee', 'name avatar').populate('reporter', 'name avatar').populate('project', 'name');
    if (!task) return errorResponse(res, 'Task not found', 404);
    successResponse(res, task);
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    req.body.reporter = req.user.id;
    const task = await Task.create(req.body);
    
    if (task.assignee) {
      await Notification.create({
        recipient: task.assignee, sender: req.user.id, type: 'task_assigned',
        title: 'Task Assigned', message: `You have been assigned: ${task.title}`,
        relatedId: task._id, relatedModel: 'Task'
      });
    }

    await logActivity(req.user.id, 'created_task', 'Task', task._id, task.title, task.project, 'Created task');
    successResponse(res, task, 'Task created', 201);
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return errorResponse(res, 'Task not found', 404);

    const oldStatus = task.status;
    Object.assign(task, req.body);
    await task.save();

    if (oldStatus !== task.status && task.assignee && task.assignee.toString() !== req.user.id) {
      await Notification.create({
        recipient: task.assignee, sender: req.user.id, type: 'task_updated',
        title: 'Task Status Updated', message: `Task ${task.title} moved to ${task.status}`,
        relatedId: task._id, relatedModel: 'Task'
      });
    }

    await logActivity(req.user.id, 'updated_task', 'Task', task._id, task.title, task.project, 'Updated task details');
    successResponse(res, task);
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { isArchived: true });
    if (!task) return errorResponse(res, 'Task not found', 404);
    await logActivity(req.user.id, 'deleted_task', 'Task', task._id, task.title, task.project, 'Archived task');
    successResponse(res, null, 'Task deleted');
  } catch (err) { next(err); }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status, order: req.body.order }, { new: true });
    if (!task) return errorResponse(res, 'Task not found', 404);
    successResponse(res, task, 'Status updated');
  } catch (err) { next(err); }
};

exports.getKanbanTasks = async (req, res, next) => {
  try {
    const targetProject = req.query.project || req.query.projectId;
    const query = { isArchived: false };
    if (targetProject) query.project = targetProject;
    
    const tasks = await Task.find(query).populate('assignee', 'name avatar').populate('project', 'name').sort('order');
    const grouped = { todo: [], inprogress: [], inreview: [], done: [] };
    tasks.forEach(t => { if (grouped[t.status]) grouped[t.status].push(t); });
    successResponse(res, grouped);
  } catch (err) { next(err); }
};

exports.assignTask = async (req, res, next) => {
  try {
    const assignee = req.body.assignee !== undefined ? req.body.assignee : req.body.assigneeId;
    const task = await Task.findByIdAndUpdate(req.params.id, { assignee }, { new: true });
    if (!task) return errorResponse(res, 'Task not found', 404);
    if (task.assignee) {
      await Notification.create({
        recipient: task.assignee, sender: req.user.id, type: 'task_assigned',
        title: 'Task Assigned', message: `You have been assigned: ${task.title}`,
        relatedId: task._id, relatedModel: 'Task'
      });
    }
    successResponse(res, task, 'Task assigned');
  } catch (err) { next(err); }
};
