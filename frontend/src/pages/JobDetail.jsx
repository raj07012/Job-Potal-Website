import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((r) => setJob(r.data))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('coverLetter', coverLetter);
      if (resumeFile) fd.append('resume', resumeFile);
      await api.post(`/applications/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setApplied(true);
      setShowModal(false);
      setSuccess('🎉 Application submitted successfully!');
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Application failed';
      setError(msg);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!job) return null;

  const typeClass = {
    'full-time': 'fulltime',
    'part-time': 'parttime',
    remote: 'remote',
    internship: 'internship',
    contract: 'contract',
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="page-container" style={{ maxWidth: 900 }}>
        <Link
          to="/jobs"
          style={{
            color: 'var(--text2)',
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 24,
          }}
        >
          ← Back to Jobs
        </Link>

        {success && (
          <div className="success-msg" style={{ marginBottom: 20 }}>
            {success}
          </div>
        )}

        <div className="card" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>
                {job.title}
              </h1>
              <p
                style={{
                  color: 'var(--accent2)',
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                {job.company}
              </p>
            </div>
            <span
              className={`badge badge-${typeClass[job.jobType] || 'fulltime'}`}
              style={{ fontSize: 12, padding: '6px 14px' }}
            >
              {job.jobType}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
              marginBottom: 24,
              padding: '16px 0',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              📍{' '}
              <strong style={{ color: 'var(--text)' }}>{job.location}</strong>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              💼{' '}
              <strong style={{ color: 'var(--text)' }}>{job.experience}</strong>
            </div>
            {job.salary?.min && (
              <div style={{ fontSize: 14, color: 'var(--text2)' }}>
                💰{' '}
                <strong style={{ color: 'var(--text)' }}>
                  ₹{(job.salary.min / 1000).toFixed(0)}K – ₹
                  {(job.salary.max / 1000).toFixed(0)}K/mo
                </strong>
              </div>
            )}
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              👥{' '}
              <strong style={{ color: 'var(--text)' }}>
                {job.applicantsCount} applicants
              </strong>
            </div>
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text2)',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Skills Required
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {job.skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      padding: '5px 12px',
                      background: 'var(--accent-glow)',
                      color: 'var(--accent2)',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: '0.9rem',
                color: 'var(--text2)',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Job Description
            </h3>
            <p
              style={{
                color: 'var(--text)',
                lineHeight: 1.8,
                fontSize: 15,
                whiteSpace: 'pre-line',
              }}
            >
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text2)',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Requirements
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {job.requirements.map((r, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      fontSize: 14,
                      color: 'var(--text)',
                    }}
                  >
                    <span style={{ color: 'var(--accent)', marginTop: 2 }}>
                      ✓
                    </span>{' '}
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Button */}
          <div style={{ paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            {!user ? (
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ fontSize: 15, padding: '13px 32px' }}
              >
                🔐 Login to Apply
              </Link>
            ) : user.role === 'recruiter' ? (
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>
                👋 You're logged in as a recruiter. Switch to a job seeker
                account to apply.
              </p>
            ) : applied ? (
              <div className="success-msg">
                ✅ You have applied for this job!
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
                style={{ fontSize: 15, padding: '13px 32px' }}
              >
                🚀 Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Recruiter Info */}
        {job.recruiter && (
          <div className="card">
            <h3
              style={{
                marginBottom: 12,
                fontSize: '0.9rem',
                color: 'var(--text2)',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Posted By
            </h3>
            <p style={{ fontWeight: 600 }}>{job.recruiter.name}</p>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>{job.company}</p>
            {job.recruiter.email && (
              <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
                📧 {job.recruiter.email}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div
          className="apply-modal-wrap"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 24,
          }}
        >
          <div
            className="card apply-modal-inner"
            style={{
              width: '100%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: '1.3rem' }}>Apply for {job.title}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text2)',
                  fontSize: 20,
                }}
              >
                ✕
              </button>
            </div>
            {error && (
              <div className="error-msg" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>
                  Resume (PDF/DOC) {user?.resume && '— or use saved resume'}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  style={{ padding: '10px', cursor: 'pointer' }}
                />
                {user?.resume && !resumeFile && (
                  <span style={{ fontSize: 12, color: 'var(--success)' }}>
                    ✓ Will use your saved resume
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Cover Letter (optional)</label>
                <textarea
                  rows={5}
                  placeholder="Tell the recruiter why you're a great fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center' }}
                  disabled={applying}
                >
                  {applying ? '⏳ Submitting...' : '🚀 Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
