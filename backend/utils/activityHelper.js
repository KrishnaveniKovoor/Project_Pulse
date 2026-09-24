const Activity = require('../models/Activity');

exports.logActivity = async (userId, action, entityType, entityId, entityTitle, projectId, description = '') => {
  try {
    await Activity.create({
      user: userId,
      action,
      entityType,
      entityId,
      entityTitle,
      project: projectId,
      description
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
