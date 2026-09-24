const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  isEdited: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
