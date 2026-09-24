const Attachment = require('../models/Attachment');
const fs = require('fs');
const path = require('path');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'Please upload a file', 400);

    const attachment = await Attachment.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.user.id,
      task: req.body.task,
      issue: req.body.issue,
      project: req.body.project
    });

    successResponse(res, attachment, 'File uploaded successfully', 201);
  } catch (err) { next(err); }
};

exports.getAttachments = async (req, res, next) => {
  try {
    const { task, issue, project } = req.query;
    const query = {};
    if (task) query.task = task;
    if (issue) query.issue = issue;
    if (project) query.project = project;

    const attachments = await Attachment.find(query).populate('uploadedBy', 'name avatar').sort('-createdAt');
    successResponse(res, attachments);
  } catch (err) { next(err); }
};

exports.deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) return errorResponse(res, 'Attachment not found', 404);

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', attachment.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await attachment.deleteOne();
    successResponse(res, null, 'Attachment deleted');
  } catch (err) { next(err); }
};
