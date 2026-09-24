const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const ProjectMember = require('../models/ProjectMember');
const { logActivity } = require('../utils/activityHelper');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getSprints = async (req, res, next) => {
  try {
    const targetProject = req.query.project || req.query.projectId;
    const query = {};
    if (targetProject) query.project = targetProject;
    const sprints = await Sprint.find(query).populate('project', 'name').sort('-createdAt');
    successResponse(res, sprints);
  } catch (err) { next(err); }
};

exports.getSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate('tasks').populate('project', 'name');
    if (!sprint) return errorResponse(res, 'Sprint not found', 404);
    successResponse(res, sprint);
  } catch (err) { next(err); }
};

exports.createSprint = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const sprint = await Sprint.create(req.body);
    await logActivity(req.user.id, 'created_sprint', 'Sprint', sprint._id, sprint.name, sprint.project, 'Created new sprint');
    successResponse(res, sprint, 'Sprint created', 201);
  } catch (err) { next(err); }
};

exports.updateSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sprint) return errorResponse(res, 'Sprint not found', 404);
    successResponse(res, sprint);
  } catch (err) { next(err); }
};

exports.deleteSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) return errorResponse(res, 'Sprint not found', 404);
    await Task.updateMany({ sprint: sprint._id }, { sprint: null });
    successResponse(res, null, 'Sprint deleted');
  } catch (err) { next(err); }
};

exports.startSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, { status: 'active', startDate: Date.now() }, { new: true });
    if (!sprint) return errorResponse(res, 'Sprint not found', 404);
    const members = await ProjectMember.find({ project: sprint.project });
    
    const notifications = members.map(m => ({
      recipient: m.user, sender: req.user.id, type: 'sprint_started',
      title: 'Sprint Started', message: `Sprint ${sprint.name} has started`,
      relatedId: sprint._id, relatedModel: 'Sprint'
    }));
    await Notification.insertMany(notifications);
    
    await logActivity(req.user.id, 'started_sprint', 'Sprint', sprint._id, sprint.name, sprint.project, 'Started sprint');
    successResponse(res, sprint, 'Sprint started');
  } catch (err) { next(err); }
};

exports.completeSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, { status: 'completed', endDate: Date.now() }, { new: true });
    if (!sprint) return errorResponse(res, 'Sprint not found', 404);
    await logActivity(req.user.id, 'completed_sprint', 'Sprint', sprint._id, sprint.name, sprint.project, 'Completed sprint');
    successResponse(res, sprint, 'Sprint completed');
  } catch (err) { next(err); }
};

exports.addTaskToSprint = async (req, res, next) => {
  try {
    const taskId = req.params.taskId || req.body.taskId;
    if (!taskId) return errorResponse(res, 'Task ID is required', 400);
    const task = await Task.findByIdAndUpdate(taskId, { sprint: req.params.id }, { new: true });
    if (!task) return errorResponse(res, 'Task not found', 404);
    await Sprint.findByIdAndUpdate(req.params.id, { $addToSet: { tasks: task._id } });
    successResponse(res, null, 'Task added to sprint');
  } catch (err) { next(err); }
};

exports.removeTaskFromSprint = async (req, res, next) => {
  try {
    const taskId = req.params.taskId || req.body.taskId;
    if (!taskId) return errorResponse(res, 'Task ID is required', 400);
    await Task.findByIdAndUpdate(taskId, { sprint: null });
    await Sprint.findByIdAndUpdate(req.params.id, { $pull: { tasks: taskId } });
    successResponse(res, null, 'Task removed from sprint');
  } catch (err) { next(err); }
};
