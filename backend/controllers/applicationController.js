const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendAcceptanceEmail, sendInterviewEmail } = require('../utils/emailService');

// @POST /api/applications/:jobId — jobseeker apply karta hai
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found or closed' });

    const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied for this job' });

    const resumePath = req.file ? req.file.filename : req.user.resume;
    if (!resumePath) return res.status(400).json({ message: 'Please upload a resume' });

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      recruiter: job.recruiter,
      resume: resumePath,
      coverLetter: req.body.coverLetter || ''
    });

    await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });
    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already applied for this job' });
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/applications/my — jobseeker ki apni applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location jobType salary')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/applications/job/:jobId — recruiter applicants dekhta hai
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiter.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email skills bio location')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/applications/:id/status — recruiter status update karta hai
// Email SIRF shortlisted ya hired pe bhejta hai
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('job', 'title company');

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.recruiter.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const oldStatus = application.status;
    application.status = status;
    await application.save();

    // Email shortlisted ya hired pe bhejo
    if (oldStatus !== status && (status === 'shortlisted' || status === 'hired') && application.applicant?.email) {
      sendAcceptanceEmail({
        applicantEmail: application.applicant.email,
        applicantName: application.applicant.name,
        jobTitle: application.job?.title || 'N/A',
        company: application.job?.company || 'N/A',
        newStatus: status,
        recruiterName: req.user.name,
        recruiterEmail: req.user.email,
      }).catch(err => console.error('Email failed:', err.message));
    }

    res.json({ message: 'Status updated', application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/applications/recruiter/all — recruiter ki saari applications
const getAllRecruiterApplications = async (req, res) => {
  try {
    const applications = await Application.find({ recruiter: req.user._id })
      .populate('job', 'title company')
      .populate('applicant', 'name email skills location')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/applications/:id/interview — recruiter interview schedule karta hai
const scheduleInterview = async (req, res) => {
  try {
    const { interviewDate, interviewTime, interviewLink, interviewNote } = req.body;

    if (!interviewDate) return res.status(400).json({ message: 'Interview date required' });

    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('job', 'title company');

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.recruiter.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    application.status = 'interview_scheduled';
    application.interviewDate = new Date(interviewDate);
    application.interviewTime = interviewTime || '';
    application.interviewLink = interviewLink || '';
    application.interviewNote = interviewNote || '';
    await application.save();

    // Interview email bhejo applicant ko
    if (application.applicant?.email) {
      sendInterviewEmail({
        applicantEmail: application.applicant.email,
        applicantName: application.applicant.name,
        jobTitle: application.job?.title || 'N/A',
        company: application.job?.company || 'N/A',
        recruiterName: req.user.name,
        recruiterEmail: req.user.email,
        interviewDate,
        interviewTime,
        interviewLink,
        interviewNote,
      }).catch(err => console.error('Interview email failed:', err.message));
    }

    res.json({ message: 'Interview scheduled successfully!', application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus, getAllRecruiterApplications, scheduleInterview };
