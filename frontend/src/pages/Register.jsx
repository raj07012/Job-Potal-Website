import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: params.get('role') || 'jobseeker', company: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword)
      return setError('Passwords do not match');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role, company: form.company });
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'90vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:460 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🚀</div>
          <h1 style={{ fontSize:'1.8rem', marginBottom:8 }}>Create Account</h1>
          <p style={{ color:'var(--text2)' }}>Join HireHub today — it's free!</p>
        </div>

        <div className="card">
          {error && <div className="error-msg" style={{ marginBottom:16 }}>{error}</div>}

          {/* Role Toggle */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
            {['jobseeker', 'recruiter'].map(r => (
              <button key={r} type="button"
                onClick={() => setForm({ ...form, role: r })}
                style={{
                  padding:'10px', borderRadius:10, border:'1px solid',
                  borderColor: form.role === r ? 'var(--accent)' : 'var(--border)',
                  background: form.role === r ? 'var(--accent-glow)' : 'transparent',
                  color: form.role === r ? 'var(--accent2)' : 'var(--text2)',
                  fontWeight:600, fontSize:13, transition:'all 0.2s'
                }}>
                {r === 'jobseeker' ? '👤 Job Seeker' : '🏢 Recruiter'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" placeholder="Raj Sharma" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            {form.role === 'recruiter' && (
              <div className="form-group">
                <label>Company Name</label>
                <input name="company" placeholder="Acme Corp" value={form.company} onChange={handleChange} required />
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" placeholder="Min 6 chars" value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input name="confirmPassword" type="password" placeholder="Repeat" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8, padding:14 }} disabled={loading}>
              {loading ? '⏳ Creating...' : '🎉 Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:20, color:'var(--text2)', fontSize:14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--accent2)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
