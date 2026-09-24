const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, page = 1, limit = 20 } = req.query;
    const query = { recipient: req.user.id };
    if (unreadOnly === 'true') query.isRead = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notifications = await Notification.find(query).skip(skip).limit(parseInt(limit)).sort('-createdAt');
    const total = await Notification.countDocuments(query);

    res.status(200).json({ success: true, count: notifications.length, total, data: notifications });
  } catch (err) { next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user.id }, { isRead: true }, { new: true });
    if (!notification) return errorResponse(res, 'Notification not found', 404);
    successResponse(res, notification);
  } catch (err) { next(err); }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    successResponse(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
    if (!notification) return errorResponse(res, 'Notification not found', 404);
    successResponse(res, null, 'Notification deleted');
  } catch (err) { next(err); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    successResponse(res, { count });
  } catch (err) { next(err); }
};
