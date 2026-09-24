const express = require('express');
const router = express.Router();
const { uploadAttachment, getAttachments, deleteAttachment } = require('../controllers/attachmentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getAttachments)
  .post(upload.single('file'), uploadAttachment);

router.delete('/:id', deleteAttachment);

module.exports = router;
