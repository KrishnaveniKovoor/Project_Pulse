const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, orgName } = req.body;
    let user = await User.findOne({ email });
    if (user) return errorResponse(res, 'User already exists', 400);

    // The first account bootstraps the workspace. Subsequent users must be
    // provisioned by its administrator; a submitted role is never trusted.
    const adminExists = await User.exists({ role: 'org_admin' });
    if (adminExists) {
      return errorResponse(res, 'Account creation is disabled. Contact your organization administrator.', 403);
    }

    const organization = await Organization.create({ name: orgName || 'My Organization' });
    
    user = await User.create({
      name, email, password, role: 'org_admin', organization: organization._id
    });
    
    organization.owner = user._id;
    organization.members.push({ user: user._id, role: 'org_admin' });
    await organization.save();

    const token = generateToken(user._id);
    res.status(201).json({ success: true, data: { token, user } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, 'Please provide email and password', 400);

    const user = await User.findOne({ email }).select('+password').populate('organization');
    if (!user) return errorResponse(res, 'Invalid credentials', 401);

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials', 401);

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ success: true, data: { token, user } });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  res.status(200).json({ success: true, data: {} });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('organization');
    successResponse(res, user);
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, {
      name: req.body.name, avatar: req.body.avatar
    }, { new: true, runValidators: true });
    successResponse(res, user);
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(req.body.oldPassword))) return errorResponse(res, 'Incorrect current password', 401);
    
    user.password = req.body.newPassword;
    await user.save();
    successResponse(res, null, 'Password updated successfully');
  } catch (err) { next(err); }
};
