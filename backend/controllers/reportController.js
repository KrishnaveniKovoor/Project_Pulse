const Task = require('../models/Task');
const Sprint = require('../models/Sprint');
const Project = require('../models/Project');
const User = require('../models/User');
const { successResponse } = require('../utils/apiResponse');

exports.getProjectReport = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const total = await Task.countDocuments({ project: projectId, isArchived: false });
    const done = await Task.countDocuments({ project: projectId, status: 'done', isArchived: false });
    const inprogress = await Task.countDocuments({ project: projectId, status: 'inprogress', isArchived: false });
    const todo = await Task.countDocuments({ project: projectId, status: 'todo', isArchived: false });
    const inreview = await Task.countDocuments({ project: projectId, status: 'inreview', isArchived: false });
    
    successResponse(res, { total, done, inprogress, todo, inreview, completionPercentage: total ? Math.round((done / total) * 100) : 0 });
  } catch (err) { next(err); }
};

exports.getSprintReport = async (req, res, next) => {
  try {
    const { sprintId } = req.params;
    const tasks = await Task.find({ sprint: sprintId });
    let totalPoints = 0;
    let completedPoints = 0;
    
    tasks.forEach(t => {
      totalPoints += t.storyPoints || 0;
      if (t.status === 'done') completedPoints += t.storyPoints || 0;
    });

    successResponse(res, { totalTasks: tasks.length, totalPoints, completedPoints });
  } catch (err) { next(err); }
};

exports.getWorkloadReport = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const query = { isArchived: false, status: { $ne: 'done' } };
    if (projectId) query.project = projectId;

    const tasks = await Task.find(query).populate('assignee', 'name');
    const workload = {};
    
    tasks.forEach(t => {
      if (t.assignee) {
        if (!workload[t.assignee.name]) workload[t.assignee.name] = { count: 0, points: 0 };
        workload[t.assignee.name].count += 1;
        workload[t.assignee.name].points += t.storyPoints || 0;
      }
    });

    successResponse(res, workload);
  } catch (err) { next(err); }
};

exports.getOverviewReport = async (req, res, next) => {
  try {
    const orgId = req.user.organization;
    const activeProjects = await Project.countDocuments({ organization: orgId, status: 'active', isArchived: false });
    const totalUsers = await User.countDocuments({ organization: orgId });
    
    successResponse(res, { activeProjects, totalUsers });
  } catch (err) { next(err); }
};

exports.getOverdueReport = async (req, res, next) => {
  try {
    const overdueTasks = await Task.find({ 
      isArchived: false, 
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() }
    }).populate('project', 'name').populate('assignee', 'name');
    
    successResponse(res, overdueTasks);
  } catch (err) { next(err); }
};
