const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: [
      'task_assigned', 'task_updated', 'comment_added', 'issue_assigned', 
      'sprint_started', 'member_added', 'task_overdue', 'project_update'
    ] 
  },
  title: { type: String },
  message: { type: String },
  isRead: { type: Boolean, default: false },
  link: { type: String },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
