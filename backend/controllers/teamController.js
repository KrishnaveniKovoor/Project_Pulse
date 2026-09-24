const Team = require('../models/Team');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ organization: req.user.organization }).populate('lead', 'name avatar');
    successResponse(res, teams);
  } catch (err) { next(err); }
};

exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate('members.user', 'name avatar email').populate('projects', 'name status');
    if (!team) return errorResponse(res, 'Team not found', 404);
    successResponse(res, team);
  } catch (err) { next(err); }
};

exports.createTeam = async (req, res, next) => {
  try {
    const team = await Team.create({ ...req.body, organization: req.user.organization });
    successResponse(res, team, 'Team created', 201);
  } catch (err) { next(err); }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!team) return errorResponse(res, 'Team not found', 404);
    successResponse(res, team);
  } catch (err) { next(err); }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return errorResponse(res, 'Team not found', 404);
    successResponse(res, null, 'Team deleted');
  } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return errorResponse(res, 'Team not found', 404);
    if (team.members.some(m => m.user.toString() === req.body.userId)) return errorResponse(res, 'User already in team', 400);
    
    team.members.push({ user: req.body.userId, role: req.body.role || 'member' });
    await team.save();
    successResponse(res, team, 'Member added');
  } catch (err) { next(err); }
};

exports.removeMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return errorResponse(res, 'Team not found', 404);
    team.members = team.members.filter(m => m.user.toString() !== req.params.userId);
    await team.save();
    successResponse(res, team, 'Member removed');
  } catch (err) { next(err); }
};
