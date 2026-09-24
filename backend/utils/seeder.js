const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Team = require('../models/Team');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task');
const Sprint = require('../models/Sprint');
const Milestone = require('../models/Milestone');
const Issue = require('../models/Issue');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedPassword = process.env.SEED_PASSWORD || 'password123';

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectpulse');
    console.log('MongoDB Connected for Seeding');

    // 0. Drop Indexes
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.dropIndexes();
    }
    console.log('Indexes dropped');

    // 1. Clear DB
    await Promise.all([
      User.deleteMany(), Organization.deleteMany(), Team.deleteMany(),
      Project.deleteMany(), ProjectMember.deleteMany(), Task.deleteMany(),
      Sprint.deleteMany(), Milestone.deleteMany(), Issue.deleteMany(),
      Activity.deleteMany(), Notification.deleteMany(), Comment.deleteMany(), Attachment.deleteMany()
    ]);
    console.log('Database cleared');

    // 2. Create Organization
    const org = await Organization.create({ name: 'TechCorp Inc', description: 'Tech Corporation' });
    console.log('Organization created');

    // 3. Create Users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@projectpulse.com', password: seedPassword, role: 'org_admin', organization: org._id },
      { name: 'Project Manager', email: 'pm@projectpulse.com', password: seedPassword, role: 'project_manager', organization: org._id },
      { name: 'Developer', email: 'dev@projectpulse.com', password: seedPassword, role: 'developer', organization: org._id },
      { name: 'Stakeholder', email: 'stakeholder@projectpulse.com', password: seedPassword, role: 'stakeholder', organization: org._id }
    ]);
    console.log('Users created');
    
    org.owner = users[0]._id;
    org.members = users.map(u => ({ user: u._id, role: u.role }));
    await org.save();

    // 4. Create Teams
    const teams = await Team.create([
      { name: 'Frontend Team', organization: org._id, lead: users[1]._id },
      { name: 'Backend Team', organization: org._id, lead: users[1]._id },
      { name: 'QA Team', organization: org._id, lead: users[2]._id }
    ]);
    console.log('Teams created');

    // 5. Create Projects
    const projects = await Project.create([
      { name: 'Website Redesign', description: 'Modernize the corporate website', organization: org._id, team: teams[0]._id, manager: users[1]._id, status: 'active', priority: 'high' },
      { name: 'Mobile App Development', description: 'Launch new iOS and Android app', organization: org._id, team: teams[1]._id, manager: users[1]._id, status: 'active', priority: 'critical' },
      { name: 'AI Analytics Platform', description: 'Data-driven insights for stakeholders', organization: org._id, team: teams[2]._id, manager: users[0]._id, status: 'planning', priority: 'medium' }
    ]);
    console.log('Projects created');

    // 6. Create Project Members
    for (const project of projects) {
      await ProjectMember.create({ project: project._id, user: users[1]._id, role: 'manager' });
      await ProjectMember.create({ project: project._id, user: users[2]._id, role: 'developer' });
    }

    // 7. Sprints, 8. Tasks, 9. Milestones, 10. Issues
    for (const project of projects) {
      const sprints = await Sprint.create([
        { name: 'Sprint 1', project: project._id, status: 'completed' },
        { name: 'Sprint 2', project: project._id, status: 'active' }
      ]);
      
      for (let i = 1; i <= 10; i++) {
        await Task.create({
          title: `Task ${i} for ${project.name}`,
          project: project._id,
          sprint: i <= 5 ? sprints[0]._id : sprints[1]._id,
          reporter: users[1]._id,
          assignee: users[2]._id,
          status: i <= 3 ? 'done' : i <= 7 ? 'inprogress' : 'todo'
        });
      }

      await Milestone.create({
        name: `Milestone 1 for ${project.name}`, project: project._id, dueDate: new Date()
      });
      
      await Issue.create({
        title: `Bug in ${project.name}`, project: project._id, reporter: users[2]._id, status: 'open'
      });
    }
    console.log('Sprints, Tasks, Milestones, Issues created');

    console.log('Seeding finished successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
