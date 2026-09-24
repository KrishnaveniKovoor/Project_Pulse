const Organization = require('../models/Organization');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organization).populate('members.user', 'name email avatar role');
    if (!org) return errorResponse(res, 'Organization not found', 404);
    successResponse(res, org);
  } catch (err) { next(err); }
};

exports.updateOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.user.organization, req.body, { new: true, runValidators: true });
    successResponse(res, org);
  } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const org = await Organization.findById(req.user.organization);
    if (org.members.some(m => m.user.toString() === userId)) return errorResponse(res, 'User already in organization', 400);
    
    org.members.push({ user: userId, role: role || 'developer' });
    await org.save();
    await User.findByIdAndUpdate(userId, { organization: org._id, role: role || 'developer' });
    successResponse(res, org, 'Member added');
  } catch (err) { next(err); }
};

exports.removeMember = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organization);
    org.members = org.members.filter(m => m.user.toString() !== req.params.userId);
    await org.save();
    await User.findByIdAndUpdate(req.params.userId, { organization: null, isActive: false });
    successResponse(res, org, 'Member removed');
  } catch (err) { next(err); }
};

exports.getOrgStats = async (req, res, next) => {
  try {
    const orgId = req.user.organization;
    const totalProjects = await Project.countDocuments({ organization: orgId });
    const totalTasks = await Task.countDocuments({ project: { $in: await Project.find({ organization: orgId }).distinct('_id') } });
    const totalMembers = await User.countDocuments({ organization: orgId });
    const totalTeams = await Team.countDocuments({ organization: orgId });
    
    successResponse(res, { totalProjects, totalTasks, totalMembers, totalTeams });
  } catch (err) { next(err); }
};
