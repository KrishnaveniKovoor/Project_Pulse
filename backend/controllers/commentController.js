const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getComments = async (req, res, next) => {
  try {
    const { task, issue, project, projectId } = req.query;
    const query = {};
    if (task) query.task = task;
    if (issue) query.issue = issue;
    if (project || projectId) query.project = project || projectId;

    const comments = await Comment.find(query).populate('author', 'name avatar').sort('createdAt');
    successResponse(res, comments);
  } catch (err) { next(err); }
};

exports.createComment = async (req, res, next) => {
  try {
    req.body.author = req.user.id;
    if (!req.body.text && req.body.content) {
      req.body.text = req.body.content;
    }
    const comment = await Comment.create(req.body);
    
    // Notify task assignee if it's a task comment
    if (req.body.task) {
      const task = await Task.findById(req.body.task);
      if (task && task.assignee && task.assignee.toString() !== req.user.id) {
        await Notification.create({
          recipient: task.assignee, sender: req.user.id, type: 'comment_added',
          title: 'New Comment', message: `New comment on task ${task.title}`,
          relatedId: task._id, relatedModel: 'Task'
        });
      }
    }

    const populated = await Comment.findById(comment._id).populate('author', 'name avatar');
    successResponse(res, populated, 'Comment added', 201);
  } catch (err) { next(err); }
};

exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return errorResponse(res, 'Comment not found', 404);
    if (comment.author.toString() !== req.user.id) return errorResponse(res, 'Not authorized', 403);
    
    comment.text = req.body.text || req.body.content || comment.text;
    comment.isEdited = true;
    await comment.save();
    successResponse(res, comment);
  } catch (err) { next(err); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return errorResponse(res, 'Comment not found', 404);
    if (comment.author.toString() !== req.user.id && req.user.role !== 'org_admin') return errorResponse(res, 'Not authorized', 403);
    
    await comment.deleteOne();
    successResponse(res, null, 'Comment deleted');
  } catch (err) { next(err); }
};
