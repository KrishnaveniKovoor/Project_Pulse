const Milestone = require('../models/Milestone');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getMilestones = async (req, res, next) => {
  try {
    const targetProject = req.query.project || req.query.projectId;
    const query = {};
    if (targetProject) query.project = targetProject;
    const milestones = await Milestone.find(query).sort('dueDate');
    successResponse(res, milestones);
  } catch (err) { next(err); }
};

exports.getMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id).populate('tasks');
    if (!milestone) return errorResponse(res, 'Milestone not found', 404);
    successResponse(res, milestone);
  } catch (err) { next(err); }
};

exports.createMilestone = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const milestone = await Milestone.create(req.body);
    successResponse(res, milestone, 'Milestone created', 201);
  } catch (err) { next(err); }
};

exports.updateMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    successResponse(res, milestone);
  } catch (err) { next(err); }
};

exports.deleteMilestone = async (req, res, next) => {
  try {
    await Milestone.findByIdAndDelete(req.params.id);
    successResponse(res, null, 'Milestone deleted');
  } catch (err) { next(err); }
};
