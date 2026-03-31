const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs } = require('../controllers/jobController');
const { protect, recruiterOnly } = require('../middleware/auth');

router.get('/', getAllJobs);
router.get('/recruiter/my', protect, recruiterOnly, getMyJobs);
router.get('/:id', getJobById);
router.post('/', protect, recruiterOnly, createJob);
router.put('/:id', protect, recruiterOnly, updateJob);
router.delete('/:id', protect, recruiterOnly, deleteJob);

module.exports = router;
