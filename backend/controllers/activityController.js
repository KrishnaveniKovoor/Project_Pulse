const Activity = require('../models/Activity');
const { successResponse } = require('../utils/apiResponse');

exports.getActivities = async (req, res, next) => {
  try {
    const { project, projectId, page = 1, limit = 20 } = req.query;
    const query = {};
    const targetProject = project || projectId;
    if (targetProject) query.project = targetProject;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const activities = await Activity.find(query).skip(skip).limit(parseInt(limit)).populate('user', 'name avatar').sort('-createdAt');
    const total = await Activity.countDocuments(query);
    
    res.status(200).json({ success: true, count: activities.length, total, data: activities });
  } catch (err) { next(err); }
};

exports.getUserActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort('-createdAt').limit(20).populate('project', 'name');
    successResponse(res, activities);
  } catch (err) { next(err); }
};
