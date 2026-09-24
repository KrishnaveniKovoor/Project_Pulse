const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task');
const Sprint = require('../models/Sprint');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityHelper');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { organization: req.user.organization, isArchived: false };
    if (req.query.status) query.status = req.query.status;
    
    if (req.user.role !== 'org_admin') {
      const myProjects = await ProjectMember.find({ user: req.user.id }).distinct('project');
      query.$or = [{ _id: { $in: myProjects } }, { manager: req.user.id }];
    }
    
    const projects = await Project.find(query).skip(skip).limit(limit).populate('manager', 'name avatar');
    const total = await Project.countDocuments(query);
    
    res.status(200).json({ success: true, count: projects.length, total, data: projects });
  } catch (err) { next(err); }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name avatar')
      .populate('team', 'name')
      .populate('members', 'name avatar role');
    if (!project) return errorResponse(res, 'Project not found', 404);
    successResponse(res, project);
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    req.body.organization = req.user.organization;
    req.body.manager = req.user.id;
    const project = await Project.create(req.body);
    
    await ProjectMember.create({
      project: project._id, user: req.user.id, role: 'manager', addedBy: req.user.id
    });
    project.members.push(req.user.id);
    await project.save();

    await logActivity(req.user.id, 'created_project', 'Project', project._id, project.name, project._id, 'Created new project');
    successResponse(res, project, 'Project created', 201);
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return errorResponse(res, 'Project not found', 404);
    await logActivity(req.user.id, 'updated_project', 'Project', project._id, project.name, project._id, 'Updated project details');
    successResponse(res, project);
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!project) return errorResponse(res, 'Project not found', 404);
    await Task.updateMany({ project: project._id }, { isArchived: true });
    await logActivity(req.user.id, 'deleted_project', 'Project', project._id, project.name, project._id, 'Archived project');
    successResponse(res, null, 'Project archived');
  } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return errorResponse(res, 'Project not found', 404);

    const existingMember = await ProjectMember.findOne({ project: project._id, user: userId });
    if (existingMember) return errorResponse(res, 'User already in project', 400);

    await ProjectMember.create({ project: project._id, user: userId, role, addedBy: req.user.id });
    project.members.push(userId);
    await project.save();

    await Notification.create({
      recipient: userId, sender: req.user.id, type: 'member_added',
      title: 'Added to project', message: `You were added to ${project.name}`,
      relatedId: project._id, relatedModel: 'Project'
    });
    
    await logActivity(req.user.id, 'added_member', 'Project', project._id, project.name, project._id, 'Added member to project');
    successResponse(res, null, 'Member added');
  } catch (err) { next(err); }
};

exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    await ProjectMember.findOneAndDelete({ project: project._id, user: req.params.userId });
    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    successResponse(res, null, 'Member removed');
  } catch (err) { next(err); }
};

exports.getProjectStats = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const totalTasks = await Task.countDocuments({ project: projectId, isArchived: false });
    const completedTasks = await Task.countDocuments({ project: projectId, status: 'done', isArchived: false });
    const inProgressTasks = await Task.countDocuments({ project: projectId, status: 'inprogress', isArchived: false });
    const sprints = await Sprint.countDocuments({ project: projectId });
    const members = await ProjectMember.countDocuments({ project: projectId });

    successResponse(res, { totalTasks, completedTasks, inProgressTasks, sprints, members });
  } catch (err) { next(err); }
};

exports.getProjectActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ project: req.params.id }).populate('user', 'name avatar').sort('-createdAt').limit(50);
    successResponse(res, activities);
  } catch (err) { next(err); }
};
