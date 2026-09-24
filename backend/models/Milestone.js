const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'overdue'], 
    default: 'pending' 
  },
  completion: { type: Number, min: 0, max: 100, default: 0 },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Milestone', milestoneSchema);
