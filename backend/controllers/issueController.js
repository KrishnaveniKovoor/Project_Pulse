const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityHelper');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getIssues = async (req, res, next) => {
  try {
    const { project, projectId, status, priority, page = 1, limit = 10 } = req.query;
    const query = {};
    const targetProject = project || projectId;
    if (targetProject) query.project = targetProject;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const issues = await Issue.find(query).skip(skip).limit(parseInt(limit)).populate('assignee', 'name avatar').populate('reporter', 'name avatar').populate('project', 'name');
    const total = await Issue.countDocuments(query);

    res.status(200).json({ success: true, count: issues.length, total, data: issues });
  } catch (err) { next(err); }
};

exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('assignee', 'name avatar').populate('reporter', 'name avatar').populate('project', 'name');
    if (!issue) return errorResponse(res, 'Issue not found', 404);
    successResponse(res, issue);
  } catch (err) { next(err); }
};

exports.createIssue = async (req, res, next) => {
  try {
    req.body.reporter = req.user.id;
    const issue = await Issue.create(req.body);
    
    if (issue.assignee) {
      await Notification.create({
        recipient: issue.assignee, sender: req.user.id, type: 'issue_assigned',
        title: 'Issue Assigned', message: `Assigned issue: ${issue.title}`,
        relatedId: issue._id, relatedModel: 'Issue'
      });
    }

    await logActivity(req.user.id, 'created_issue', 'Issue', issue._id, issue.title, issue.project, 'Logged new issue');
    successResponse(res, issue, 'Issue created', 201);
  } catch (err) { next(err); }
};

exports.updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!issue) return errorResponse(res, 'Issue not found', 404);
    successResponse(res, issue);
  } catch (err) { next(err); }
};

exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return errorResponse(res, 'Issue not found', 404);
    successResponse(res, null, 'Issue deleted');
  } catch (err) { next(err); }
};

exports.assignIssue = async (req, res, next) => {
  try {
    const assignee = req.body.assignee !== undefined ? req.body.assignee : req.body.assigneeId;
    const issue = await Issue.findByIdAndUpdate(req.params.id, { assignee }, { new: true });
    if (!issue) return errorResponse(res, 'Issue not found', 404);
    if (issue.assignee) {
      await Notification.create({
        recipient: issue.assignee, sender: req.user.id, type: 'issue_assigned',
        title: 'Issue Assigned', message: `Assigned issue: ${issue.title}`,
        relatedId: issue._id, relatedModel: 'Issue'
      });
    }
    successResponse(res, issue, 'Issue assigned');
  } catch (err) { next(err); }
};
