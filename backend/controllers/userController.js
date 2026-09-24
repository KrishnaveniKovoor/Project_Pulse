const User = require('../models/User');
const Activity = require('../models/Activity');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { organization: req.user.organization };
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).skip(skip).limit(limit);
    const total = await User.countDocuments(query);
    
    res.status(200).json({ success: true, count: users.length, total, data: users });
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    successResponse(res, user);
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return errorResponse(res, 'User not found', 404);
    successResponse(res, user);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return errorResponse(res, 'User not found', 404);
    successResponse(res, null, 'User deactivated');
  } catch (err) { next(err); }
};

exports.getUserActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.params.id }).sort('-createdAt').limit(20);
    successResponse(res, activities);
  } catch (err) { next(err); }
};
