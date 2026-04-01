import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: 'badge-pending',
  reviewed: 'badge-reviewed',
  shortlisted: 'badge-shortlisted',
  rejected: 'badge-rejected',
  hired: 'badge-hired',
  interview_scheduled: 'badge-shortlisted',
};
const statusOptions = [
  'pending',
  'reviewed',
  'shortlisted',
  'rejected',
  'interview_scheduled',
  'hired',
];

const emptyJob = {
  title: '',
  description: '',
  requirements: '',
  skills: '',
  location: '',
  jobType: 'full-time',
  experience: '0-1 years',
  salary: { min: '', max: '' },
  company: '',
};

export default function RecruiterDashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('jobs');
  const [myJobs, setMyJobs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    company: user?.company || '',
    companyWebsite: user?.companyWebsite || '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [interviewModal, setInterviewModal] = useState(null); // { appId, appName, jobTitle }
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: '',
    interviewTime: '',
    interviewLink: '',
    interviewNote: '',
  });
  const [interviewSaving, setInterviewSaving] = useState(false);
  const [interviewMsg, setInterviewMsg] = useState('');

  const fetchMyJobs = () =>
    api.get('/jobs/recruiter/my').then((r) => setMyJobs(r.data));
  const fetchAllApplications = () =>
    api
      .get('/applications/recruiter/all')
      .then((r) => setAllApplications(r.data));

  useEffect(() => {
    Promise.all([fetchMyJobs(), fetchAllApplications()]).finally(() =>
      setLoading(false),
    );
  }, []);

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const payload = { ...jobForm, company: jobForm.company || user.company };
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, payload);
        setMsg('✅ Job updated!');
      } else {
        await api.post('/jobs', payload);
        setMsg('✅ Job posted successfully!');
      }
      await fetchMyJobs();
      setShowJobForm(false);
      setEditingJob(null);
      setJobForm(emptyJob);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements?.join('\n') || '',
      skills: job.skills?.join(', ') || '',
      location: job.location,
      jobType: job.jobType,
      experience: job.experience,
      salary: { min: job.salary?.min || '', max: job.salary?.max || '' },
      company: job.company,
    });
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Delete this job?')) return;
    await api.delete(`/jobs/${jobId}`);
    await fetchMyJobs();
  };

  const handleToggleActive = async (job) => {
    await api.put(`/jobs/${job._id}`, { isActive: !job.isActive });
    await fetchMyJobs();
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    const { data } = await api.get(`/applications/job/${job._id}`);
    setJobApplications(data);
    setTab('applicants');
  };

  const handleStatusChange = async (appId, newStatus, source = 'all') => {
    if (newStatus === 'interview_scheduled') {
      // Find app name for modal title
      const apps = source === 'job' ? jobApplications : allApplications;
      const app = apps.find((a) => a._id === appId);
      setInterviewForm({
        interviewDate: '',
        interviewTime: '',
        interviewLink: '',
        interviewNote: '',
      });
      setInterviewMsg('');
      setInterviewModal({
        appId,
        appName: app?.applicant?.name || 'Applicant',
        jobTitle: app?.job?.title || selectedJob?.title || 'Job',
        source,
      });
      return;
    }
    await api.put(`/applications/${appId}/status`, { status: newStatus });
    if (source === 'job') {
      const updated = jobApplications.map((a) =>
        a._id === appId ? { ...a, status: newStatus } : a,
      );
      setJobApplications(updated);
    } else {
      const updated = allApplications.map((a) =>
        a._id === appId ? { ...a, status: newStatus } : a,
      );
      setAllApplications(updated);
    }
    await fetchAllApplications();
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    setInterviewSaving(true);
    setInterviewMsg('');
    try {
      await api.put(
        `/applications/${interviewModal.appId}/interview`,
        interviewForm,
      );
      setInterviewMsg('✅ Interview scheduled! Email sent to applicant.');
      const source = interviewModal.source;
      if (source === 'job') {
        const updated = jobApplications.map((a) =>
          a._id === interviewModal.appId
            ? { ...a, status: 'interview_scheduled', ...interviewForm }
            : a,
        );
        setJobApplications(updated);
      } else {
        const updated = allApplications.map((a) =>
          a._id === interviewModal.appId
            ? { ...a, status: 'interview_scheduled', ...interviewForm }
            : a,
        );
        setAllApplications(updated);
      }
      await fetchAllApplications();
      setTimeout(() => {
        setInterviewModal(null);
        setInterviewMsg('');
      }, 1800);
    } catch (err) {
      setInterviewMsg(
        '❌ ' + (err.response?.data?.message || 'Failed to schedule'),
      );
    } finally {
      setInterviewSaving(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(profile).forEach(([k, v]) => fd.append(k, v));
      const { data } = await api.put('/auth/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      setProfileMsg('✅ Profile updated!');
    } catch {
      setProfileMsg('❌ Update failed');
    }
  };

  const stats = [
    { label: 'Jobs Posted', value: myJobs.length, icon: '📢' },
    {
      label: 'Active Jobs',
      value: myJobs.filter((j) => j.isActive).length,
      icon: '✅',
    },
    { label: 'Total Applicants', value: allApplications.length, icon: '👥' },
    {
      label: 'Hired',
      value: allApplications.filter((a) => a.status === 'hired').length,
      icon: '🎉',
    },
  ];

  const tabs = [
    { key: 'jobs', label: '📢 My Jobs' },
    { key: 'applications', label: '📋 All Applications' },
    { key: 'profile', label: '⚙️ Profile' },
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="page-container">
        {/* Header */}
        <div className="dashboard-header" style={{ marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>
              Recruiter Dashboard 🏢
            </h1>
            <p style={{ color: 'var(--text2)' }}>
              {user?.company || user?.name} — Manage your job listings and
              applicants
            </p>
          </div>
          {tab === 'jobs' && !showJobForm && (
            <button
              onClick={() => {
                setShowJobForm(true);
                setEditingJob(null);
                setJobForm(emptyJob);
              }}
              className="btn btn-primary"
            >
              + Post New Job
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 32 }}>
          {stats.map((s) => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  fontFamily: 'Syne,sans-serif',
                  color: 'var(--accent2)',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs-row" style={{ marginBottom: 24 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                whiteSpace: 'nowrap',
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                color: tab === t.key ? 'var(--accent2)' : 'var(--text2)',
                fontWeight: 600,
                fontSize: 14,
                borderBottom:
                  tab === t.key
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
          {tab === 'applicants' && selectedJob && (
            <span
              style={{
                whiteSpace: 'nowrap',
                padding: '10px 20px',
                color: 'var(--accent2)',
                fontWeight: 600,
                fontSize: 14,
                borderBottom: '2px solid var(--accent)',
                marginBottom: '-1px',
              }}
            >
              👥 {selectedJob.title}
            </span>
          )}
        </div>

        {msg && (
          <div
            className={msg.startsWith('✅') ? 'success-msg' : 'error-msg'}
            style={{ marginBottom: 16 }}
          >
            {msg}
          </div>
        )}

        {/* Job Form */}
        {tab === 'jobs' && showJobForm && (
          <div className="card" style={{ marginBottom: 24, maxWidth: 720 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h3>{editingJob ? 'Edit Job' : 'Post New Job'}</h3>
              <button
                onClick={() => {
                  setShowJobForm(false);
                  setEditingJob(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text2)',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleJobSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    placeholder="Frontend Developer"
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    placeholder={user?.company}
                    value={jobForm.company}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, company: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Job Description *</label>
                <textarea
                  rows={4}
                  placeholder="Describe the role, responsibilities..."
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, description: e.target.value })
                  }
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Requirements (one per line)</label>
                <textarea
                  rows={3}
                  placeholder="Bachelor's degree&#10;2+ years experience&#10;Strong communication skills"
                  value={jobForm.requirements}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, requirements: e.target.value })
                  }
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input
                  placeholder="React, Node.js, MongoDB"
                  value={jobForm.skills}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, skills: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    placeholder="Mumbai / Remote"
                    value={jobForm.location}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    value={jobForm.jobType}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, jobType: e.target.value })
                    }
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="remote">Remote</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Experience</label>
                  <select
                    value={jobForm.experience}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, experience: e.target.value })
                    }
                  >
                    <option value="0-1 years">Fresher (0-1 yr)</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary Range (₹/month)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={jobForm.salary.min}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          salary: { ...jobForm.salary, min: e.target.value },
                        })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={jobForm.salary.max}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          salary: { ...jobForm.salary, max: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowJobForm(false);
                    setEditingJob(null);
                  }}
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {saving
                    ? '⏳ Saving...'
                    : editingJob
                      ? '💾 Update Job'
                      : '🚀 Post Job'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Jobs Tab */}
        {tab === 'jobs' &&
          !showJobForm &&
          (loading ? (
            <div className="spinner" />
          ) : myJobs.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <h3>No jobs posted yet</h3>
              <p>Post your first job to start receiving applications</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myJobs.map((job) => (
                <div key={job._id} className="card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 4,
                          flexWrap: 'wrap',
                        }}
                      >
                        <h3 style={{ fontSize: '1.05rem' }}>{job.title}</h3>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: job.isActive
                              ? 'rgba(34,197,94,0.15)'
                              : 'rgba(239,68,68,0.12)',
                            color: job.isActive
                              ? 'var(--success)'
                              : 'var(--danger)',
                          }}
                        >
                          {job.isActive ? '● Active' : '○ Paused'}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 16,
                          flexWrap: 'wrap',
                          fontSize: 13,
                          color: 'var(--text2)',
                        }}
                      >
                        <span>📍 {job.location}</span>
                        <span>💼 {job.jobType}</span>
                        <span>👥 {job.applicantsCount} applicants</span>
                        <span>
                          📅{' '}
                          {new Date(job.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <div className="job-card-actions">
                      <button
                        onClick={() => handleViewApplicants(job)}
                        className="btn btn-outline btn-sm"
                      >
                        👥 View Applicants
                      </button>
                      <button
                        onClick={() => handleEditJob(job)}
                        className="btn btn-outline btn-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(job)}
                        className="btn btn-outline btn-sm"
                        style={{
                          color: job.isActive
                            ? 'var(--warning)'
                            : 'var(--success)',
                        }}
                      >
                        {job.isActive ? '⏸ Pause' : '▶ Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="btn btn-sm btn-danger"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* All Applications Tab */}
        {tab === 'applications' &&
          (allApplications.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <h3>No applications yet</h3>
              <p>
                Applications will appear here once candidates apply to your jobs
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {allApplications.map((app) => (
                <div key={app._id} className="card">
                  <div className="applicant-card-row">
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>
                        {app.applicant?.name}
                      </h3>
                      <p
                        style={{
                          color: 'var(--text2)',
                          fontSize: 13,
                          marginBottom: 6,
                        }}
                      >
                        📧 {app.applicant?.email}
                      </p>
                      <p
                        style={{
                          color: 'var(--accent2)',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Applied for: {app.job?.title} @ {app.job?.company}
                      </p>
                      {app.applicant?.skills?.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            flexWrap: 'wrap',
                            marginTop: 8,
                          }}
                        >
                          {app.applicant.skills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              style={{
                                padding: '2px 8px',
                                background: 'var(--accent-glow)',
                                color: 'var(--accent2)',
                                borderRadius: 4,
                                fontSize: 11,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 8,
                      }}
                    >
                      <span className={`badge ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                      <a
                        href={`/uploads/${app.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        📄 Resume
                      </a>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app._id, e.target.value, 'all')
                        }
                        style={{
                          padding: '6px 10px',
                          fontSize: 12,
                          borderRadius: 7,
                          width: 'auto',
                        }}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* Applicants for specific job */}
        {tab === 'applicants' && (
          <div>
            <button
              onClick={() => setTab('jobs')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text2)',
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ← Back to Jobs
            </button>
            <h3 style={{ marginBottom: 16 }}>
              Applicants for: {selectedJob?.title}
            </h3>
            {jobApplications.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📭</div>
                <h3>No applicants yet</h3>
              </div>
            ) : (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {jobApplications.map((app) => (
                  <div key={app._id} className="card">
                    <div className="applicant-card-row">
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>
                          {app.applicant?.name}
                        </h3>
                        <p
                          style={{
                            color: 'var(--text2)',
                            fontSize: 13,
                            marginBottom: 4,
                          }}
                        >
                          📧 {app.applicant?.email}
                        </p>
                        {app.applicant?.location && (
                          <p style={{ color: 'var(--text2)', fontSize: 13 }}>
                            📍 {app.applicant.location}
                          </p>
                        )}
                        {app.applicant?.bio && (
                          <p
                            style={{
                              color: 'var(--text2)',
                              fontSize: 13,
                              marginTop: 6,
                              fontStyle: 'italic',
                            }}
                          >
                            {app.applicant.bio.slice(0, 100)}...
                          </p>
                        )}
                        {app.applicant?.skills?.length > 0 && (
                          <div
                            style={{
                              display: 'flex',
                              gap: 6,
                              flexWrap: 'wrap',
                              marginTop: 8,
                            }}
                          >
                            {app.applicant.skills.map((s) => (
                              <span
                                key={s}
                                style={{
                                  padding: '2px 8px',
                                  background: 'var(--accent-glow)',
                                  color: 'var(--accent2)',
                                  borderRadius: 4,
                                  fontSize: 11,
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {app.coverLetter && (
                          <p
                            style={{
                              marginTop: 10,
                              fontSize: 13,
                              color: 'var(--text2)',
                              fontStyle: 'italic',
                              borderLeft: '2px solid var(--accent)',
                              paddingLeft: 10,
                            }}
                          >
                            "{app.coverLetter.slice(0, 150)}..."
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 8,
                        }}
                      >
                        <span className={`badge ${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                        <a
                          href={`/uploads/${app.resume}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          📄 View Resume
                        </a>
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app._id, e.target.value, 'job')
                          }
                          style={{
                            padding: '6px 10px',
                            fontSize: 12,
                            borderRadius: 7,
                            width: 'auto',
                          }}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="card" style={{ maxWidth: 520 }}>
            <h3 style={{ marginBottom: 20 }}>Recruiter Profile</h3>
            {profileMsg && (
              <div
                className={
                  profileMsg.startsWith('✅') ? 'success-msg' : 'error-msg'
                }
                style={{ marginBottom: 16 }}
              >
                {profileMsg}
              </div>
            )}
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label>Name</label>
                <input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  value={profile.company}
                  onChange={(e) =>
                    setProfile({ ...profile, company: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Company Website</label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={profile.companyWebsite}
                  onChange={(e) =>
                    setProfile({ ...profile, companyWebsite: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn btn-primary">
                💾 Save Profile
              </button>
            </form>
          </div>
        )}

        {/* ========== INTERVIEW SCHEDULE MODAL ========== */}
        {interviewModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              className="card"
              style={{
                width: '100%',
                maxWidth: 480,
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                    📅 Schedule Interview
                  </h3>
                  <p
                    style={{
                      color: 'var(--text2)',
                      fontSize: 13,
                      margin: '4px 0 0',
                    }}
                  >
                    {interviewModal.appName} — {interviewModal.jobTitle}
                  </p>
                </div>
                <button
                  onClick={() => setInterviewModal(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text2)',
                    fontSize: 20,
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {interviewMsg && (
                <div
                  className={
                    interviewMsg.startsWith('✅') ? 'success-msg' : 'error-msg'
                  }
                  style={{ marginBottom: 16 }}
                >
                  {interviewMsg}
                </div>
              )}

              <form onSubmit={handleInterviewSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Interview Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={interviewForm.interviewDate}
                      onChange={(e) =>
                        setInterviewForm({
                          ...interviewForm,
                          interviewDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={interviewForm.interviewTime}
                      onChange={(e) =>
                        setInterviewForm({
                          ...interviewForm,
                          interviewTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Meeting Link{' '}
                    <span style={{ color: 'var(--text2)', fontWeight: 400 }}>
                      (Google Meet / Zoom)
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={interviewForm.interviewLink}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        interviewLink: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Note for Applicant{' '}
                    <span style={{ color: 'var(--text2)', fontWeight: 400 }}>
                      (optional)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Please prepare a short intro, bring your resume..."
                    value={interviewForm.interviewNote}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        interviewNote: e.target.value,
                      })
                    }
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setInterviewModal(null)}
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={interviewSaving}
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    {interviewSaving
                      ? '⏳ Scheduling...'
                      : '📅 Schedule & Notify'}
                  </button>
                </div>
              </form>

              <p
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  color: 'var(--text2)',
                  textAlign: 'center',
                }}
              >
                📧 An email notification will be sent to the applicant
                automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
