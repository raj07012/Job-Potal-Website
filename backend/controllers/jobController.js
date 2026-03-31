const Job = require('../models/Job');

// @GET /api/jobs — public, with filters
const getAllJobs = async (req, res) => {
  try {
    const { search, location, jobType, experience, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };

    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } }
    ];
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (experience) filter.experience = experience;

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('recruiter', 'name company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name company companyWebsite email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/jobs — recruiter only
const createJob = async (req, res) => {
  try {
    const { title, description, requirements, skills, location, jobType, salary, experience } = req.body;
    const job = await Job.create({
      title, description,
      requirements: Array.isArray(requirements) ? requirements : (requirements || '').split('\n').filter(Boolean),
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean),
      location, jobType,
      salary: salary || {},
      experience: experience || '0-1 years',
      recruiter: req.user._id,
      company: req.user.company || req.body.company || 'Company'
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/jobs/:id — recruiter only
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiter.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/jobs/:id — recruiter only
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiter.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/jobs/recruiter/my — recruiter's own jobs
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };
