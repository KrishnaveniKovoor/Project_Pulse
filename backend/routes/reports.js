const express = require('express');
const router = express.Router();
const { getProjectReport, getSprintReport, getWorkloadReport, getOverviewReport, getOverdueReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/project/:projectId', getProjectReport);
router.get('/sprint/:sprintId', getSprintReport);
router.get('/workload', getWorkloadReport);
router.get('/overview', getOverviewReport);
router.get('/overdue', getOverdueReport);

module.exports = router;
