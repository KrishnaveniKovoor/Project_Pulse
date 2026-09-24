const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['planning', 'active', 'on_hold', 'completed', 'archived'], 
    default: 'planning' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'] 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  isArchived: { type: Boolean, default: false },
  progress: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
