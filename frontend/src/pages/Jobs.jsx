import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const JobCard = ({ job }) => {
  const typeClass = { 'full-time':'fulltime','part-time':'parttime','remote':'remote','internship':'internship','contract':'contract' };
  return (
    <Link to={`/jobs/${job._id}`} style={{ display:'block' }}>
      <div className="card" style={{ cursor:'pointer' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:12 }}>
          <div>
            <h3 style={{ fontSize:'1.05rem', marginBottom:4 }}>{job.title}</h3>
            <p style={{ color:'var(--accent2)', fontWeight:600, fontSize:14 }}>{job.company}</p>
          </div>
          <span className={`badge badge-${typeClass[job.jobType] || 'fulltime'}`}>{job.jobType}</span>
        </div>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:12, fontSize:13, color:'var(--text2)' }}>
          <span>📍 {job.location}</span>
          <span>💼 {job.experience}</span>
          {job.salary?.min && <span>💰 ₹{(job.salary.min/1000).toFixed(0)}K – ₹{(job.salary.max/1000).toFixed(0)}K</span>}
          <span>👥 {job.applicantsCount} applicants</span>
        </div>
        {job.skills?.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {job.skills.slice(0,5).map(s => (
              <span key={s} style={{ padding:'3px 10px', background:'var(--accent-glow)', color:'var(--accent2)', borderRadius:6, fontSize:11, fontWeight:500 }}>{s}</span>
            ))}
          </div>
        )}
        <div style={{ marginTop:12, fontSize:12, color:'var(--text3)' }}>
          Posted {new Date(job.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
        </div>
      </div>
    </Link>
  );
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', location: '', jobType: '', experience: '' });

  const fetchJobs = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchJobs(1); };

  return (
    <div style={{ padding:'40px 0 80px' }}>
      <div className="page-container">
        <h1 style={{ fontSize:'2rem', marginBottom:8 }}>Browse Jobs</h1>
        <p style={{ color:'var(--text2)', marginBottom:32 }}>{total} opportunities available</p>

        {/* Filters */}
        <form onSubmit={handleSearch} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:20, marginBottom:32 }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto', gap:12, alignItems:'end' }}>
            <div>
              <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:6 }}>Search</label>
              <input placeholder="Job title, skill, company..." value={filters.search} onChange={e => setFilters({...filters, search:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:6 }}>Location</label>
              <input placeholder="Mumbai, Remote..." value={filters.location} onChange={e => setFilters({...filters, location:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:6 }}>Type</label>
              <select value={filters.jobType} onChange={e => setFilters({...filters, jobType:e.target.value})}>
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="remote">Remote</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:6 }}>Experience</label>
              <select value={filters.experience} onChange={e => setFilters({...filters, experience:e.target.value})}>
                <option value="">Any</option>
                <option value="0-1 years">Fresher (0-1 yr)</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ height:46 }}>🔍 Search</button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="spinner" />
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Try different search terms or filters</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {jobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:40 }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchJobs(p)} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
