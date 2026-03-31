import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const stats = [
    { label: 'Jobs Posted', value: '10K+' },
    { label: 'Companies', value: '2K+' },
    { label: 'Hired', value: '50K+' },
  ];

  const features = [
    { icon: '🎯', title: 'Smart Matching', desc: 'AI-powered job recommendations based on your skills and preferences' },
    { icon: '⚡', title: 'Quick Apply', desc: 'One-click applications with your saved resume and profile' },
    { icon: '📊', title: 'Track Applications', desc: 'Real-time status updates from pending to hired' },
    { icon: '🏢', title: 'Top Companies', desc: 'Connect with industry-leading companies across all domains' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(108,99,255,0.15), transparent)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position:'absolute', inset:0,
          backgroundImage: 'radial-gradient(circle, rgba(108,99,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="page-container" style={{ position:'relative', textAlign:'center', padding:'80px 24px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', background:'var(--accent-glow)', border:'1px solid rgba(108,99,255,0.3)', borderRadius:20, marginBottom:24, fontSize:13, color:'var(--accent2)' }}>
            ✨ India's fastest growing job portal
          </div>
          <h1 style={{ fontSize:'clamp(2.4rem, 6vw, 4.5rem)', fontWeight:800, lineHeight:1.1, marginBottom:20 }}>
            Find Your <span style={{ color:'var(--accent)' }}>Dream Job</span><br />
            Land It Fast
          </h1>
          <p style={{ fontSize:'1.1rem', color:'var(--text2)', maxWidth:560, margin:'0 auto 40px', lineHeight:1.8 }}>
            Connect with top recruiters, apply instantly, and track every application — all in one sleek platform.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/jobs" className="btn btn-primary" style={{ fontSize:16, padding:'14px 32px' }}>
              🔍 Browse Jobs
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-outline" style={{ fontSize:16, padding:'14px 32px' }}>
                Get Started Free
              </Link>
            )}
            {user && (
              <Link to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard'} className="btn btn-outline" style={{ fontSize:16, padding:'14px 32px' }}>
                Go to Dashboard →
              </Link>
            )}
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:40, justifyContent:'center', marginTop:72, flexWrap:'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'2rem', fontWeight:800, fontFamily:'Syne,sans-serif', color:'var(--accent2)' }}>{s.value}</div>
                <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'80px 0', borderTop:'1px solid var(--border)' }}>
        <div className="page-container">
          <h2 style={{ textAlign:'center', fontSize:'2rem', marginBottom:8 }}>Why HireHub?</h2>
          <p style={{ textAlign:'center', color:'var(--text2)', marginBottom:48 }}>Everything you need to land your next role</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:20 }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:16 }}>{f.icon}</div>
                <h3 style={{ marginBottom:8, fontSize:'1.1rem' }}>{f.title}</h3>
                <p style={{ color:'var(--text2)', fontSize:14 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding:'80px 0', borderTop:'1px solid var(--border)', textAlign:'center' }}>
          <div className="page-container">
            <h2 style={{ fontSize:'2rem', marginBottom:12 }}>Ready to get hired?</h2>
            <p style={{ color:'var(--text2)', marginBottom:32 }}>Join thousands of professionals who found their dream jobs</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ fontSize:15, padding:'13px 28px' }}>
                🚀 Join as Job Seeker
              </Link>
              <Link to="/register?role=recruiter" className="btn btn-outline" style={{ fontSize:15, padding:'13px 28px' }}>
                🏢 Post Jobs as Recruiter
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer style={{ padding:'32px 0', borderTop:'1px solid var(--border)', textAlign:'center', color:'var(--text3)', fontSize:13 }}>
        <div className="page-container">
          <p>⚡ HireHub — Built with Node.js + MongoDB + React</p>
        </div>
      </footer>
    </div>
  );
}
