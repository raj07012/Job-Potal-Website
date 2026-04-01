import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

// Status ke liye user-friendly labels
const statusLabels = {
  pending: '⏳ Pending',
  reviewed: '👀 Reviewed',
  shortlisted: '⭐ Shortlisted',
  rejected: '❌ Rejected',
  interview_scheduled: '📅 Interview Scheduled',
  hired: '🎉 Hired!',
};

export default function JobSeekerDashboard() {
  const { user, updateUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('applications');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skills: user?.skills?.join(', ') || '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api
      .get('/applications/my')
      .then((r) => setApplications(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const fd = new FormData();
      Object.entries(profile).forEach(([k, v]) => fd.append(k, v));
      if (resumeFile) fd.append('resume', resumeFile);
      const { data } = await api.put('/auth/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      setMsg('✅ Profile updated successfully!');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Total Applied', value: applications.length, icon: '📤' },
    {
      label: 'Shortlisted',
      value: applications.filter((a) => a.status === 'shortlisted').length,
      icon: '⭐',
    },
    {
      label: 'Interviews',
      value: applications.filter((a) => a.status === 'interview_scheduled')
        .length,
      icon: '📅',
    },
    {
      label: 'Hired',
      value: applications.filter((a) => a.status === 'hired').length,
      icon: '🎉',
    },
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="page-container">
        {/* Header */}
        <div className="dashboard-header" style={{ marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>
              Welcome, {user?.name}! 👋
            </h1>
            <p style={{ color: 'var(--text2)' }}>
              Track your job applications and manage your profile
            </p>
          </div>
          <Link to="/jobs" className="btn btn-primary">
            🔍 Browse Jobs
          </Link>
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
          {['applications', 'profile'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                whiteSpace: 'nowrap',
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                color: tab === t ? 'var(--accent2)' : 'var(--text2)',
                fontWeight: 600,
                fontSize: 14,
                borderBottom:
                  tab === t
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t === 'applications' ? '📋 My Applications' : '👤 My Profile'}
            </button>
          ))}
        </div>

        {/* Applications Tab */}
        {tab === 'applications' &&
          (loading ? (
            <div className="spinner" />
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <h3>No applications yet</h3>
              <p>Start applying to jobs to track them here</p>
              <Link
                to="/jobs"
                className="btn btn-primary"
                style={{ marginTop: 16 }}
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="card"
                  style={{
                    borderLeft:
                      app.status === 'hired'
                        ? '3px solid var(--success)'
                        : app.status === 'interview_scheduled'
                          ? '3px solid #0ea5e9'
                          : app.status === 'shortlisted'
                            ? '3px solid var(--accent)'
                            : undefined,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>
                        {app.job?.title || 'Job Deleted'}
                      </h3>
                      <p
                        style={{
                          color: 'var(--accent2)',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {app.job?.company}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: 16,
                          marginTop: 8,
                          flexWrap: 'wrap',
                          fontSize: 13,
                          color: 'var(--text2)',
                        }}
                      >
                        {app.job?.location && (
                          <span>📍 {app.job.location}</span>
                        )}
                        {app.job?.jobType && <span>💼 {app.job.jobType}</span>}
                        <span>
                          📅 Applied{' '}
                          {new Date(app.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge ${statusColors[app.status] || 'badge-pending'}`}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {statusLabels[app.status] || app.status}
                    </span>
                  </div>

                  {/* 🎉 Hired Banner */}
                  {app.status === 'hired' && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: '12px 16px',
                        background: 'rgba(16,185,129,0.1)',
                        borderRadius: 10,
                        border: '1px solid rgba(16,185,129,0.3)',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: '#10b981',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        🎊 Congratulations! You have been hired!
                      </p>
                      <p
                        style={{
                          margin: '4px 0 0',
                          color: 'var(--text2)',
                          fontSize: 13,
                        }}
                      >
                        Check your email for details or contact the recruiter
                        directly.
                      </p>
                    </div>
                  )}

                  {/* 📅 Interview Scheduled Banner */}
                  {app.status === 'interview_scheduled' && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: '14px 16px',
                        background: 'rgba(14,165,233,0.1)',
                        borderRadius: 10,
                        border: '1px solid rgba(14,165,233,0.3)',
                      }}
                    >
                      <p
                        style={{
                          margin: '0 0 8px',
                          color: '#0ea5e9',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        📅 Interview Scheduled
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 16,
                          fontSize: 13,
                          color: 'var(--text2)',
                        }}
                      >
                        {app.interviewDate && (
                          <span>
                            🗓️{' '}
                            <strong style={{ color: 'var(--text1)' }}>
                              {new Date(app.interviewDate).toLocaleDateString(
                                'en-IN',
                                {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                },
                              )}
                            </strong>
                          </span>
                        )}
                        {app.interviewTime && (
                          <span>
                            🕐{' '}
                            <strong style={{ color: 'var(--text1)' }}>
                              {app.interviewTime}
                            </strong>
                          </span>
                        )}
                      </div>
                      {app.interviewLink && (
                        <a
                          href={app.interviewLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            marginTop: 10,
                            padding: '6px 14px',
                            background: '#0ea5e9',
                            color: '#fff',
                            borderRadius: 7,
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          🔗 Join Meeting
                        </a>
                      )}
                      {app.interviewNote && (
                        <p
                          style={{
                            margin: '10px 0 0',
                            fontSize: 13,
                            color: 'var(--text2)',
                            fontStyle: 'italic',
                            borderLeft: '2px solid #0ea5e9',
                            paddingLeft: 10,
                          }}
                        >
                          {app.interviewNote}
                        </p>
                      )}
                    </div>
                  )}

                  {app.coverLetter && (
                    <p
                      style={{
                        marginTop: 12,
                        fontSize: 13,
                        color: 'var(--text2)',
                        borderTop: '1px solid var(--border)',
                        paddingTop: 12,
                        fontStyle: 'italic',
                      }}
                    >
                      "{app.coverLetter.slice(0, 120)}
                      {app.coverLetter.length > 120 ? '...' : ''}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="card" style={{ maxWidth: 640 }}>
            <h3 style={{ marginBottom: 20 }}>Edit Profile</h3>
            {msg && (
              <div
                className={msg.startsWith('✅') ? 'success-msg' : 'error-msg'}
                style={{ marginBottom: 16 }}
              >
                {msg}
              </div>
            )}
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  rows={3}
                  placeholder="Tell recruiters about yourself..."
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  placeholder="Mumbai, India"
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input
                  placeholder="React, Node.js, MongoDB..."
                  value={profile.skills}
                  onChange={(e) =>
                    setProfile({ ...profile, skills: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Upload Resume (PDF/DOC)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  style={{ padding: 10, cursor: 'pointer' }}
                />
                {user?.resume && (
                  <span style={{ fontSize: 12, color: 'var(--success)' }}>
                    ✓ Current: {user.resume}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? '⏳ Saving...' : '💾 Save Profile'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
