const express = require('express');
const router = express.Router();
const { getIssues, getIssue, createIssue, updateIssue, deleteIssue, assignIssue } = require('../controllers/issueController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getIssues)
  .post(createIssue);

router.route('/:id')
  .get(getIssue)
  .put(updateIssue)
  .delete(deleteIssue);

router.put('/:id/assign', assignIssue);

module.exports = router;
