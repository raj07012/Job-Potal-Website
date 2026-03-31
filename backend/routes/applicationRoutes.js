const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getAllRecruiterApplications,
  scheduleInterview,
} = require('../controllers/applicationController');
const { protect, recruiterOnly, jobseekerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ✅ Static routes PEHLE, dynamic routes BAAD MEIN
router.get('/my', protect, jobseekerOnly, getMyApplications);
router.get(
  '/recruiter/all',
  protect,
  recruiterOnly,
  getAllRecruiterApplications,
);
router.get('/job/:jobId', protect, recruiterOnly, getJobApplications);
router.put('/:id/status', protect, recruiterOnly, updateApplicationStatus);
router.put('/:id/interview', protect, recruiterOnly, scheduleInterview);
router.post(
  '/:jobId',
  protect,
  jobseekerOnly,
  upload.single('resume'),
  applyForJob,
);

module.exports = router;
