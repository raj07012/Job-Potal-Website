import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'var(--navbar-bg)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      transition: 'background 0.3s, border-color 0.3s'
    }}>
      <div className="page-container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:36, height:36, background:'var(--accent)',
            borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, boxShadow:'0 4px 16px rgba(108,99,255,0.4)'
          }}>⚡</div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20, color:'var(--text)' }}>
            Hire<span style={{color:'var(--accent)'}}>Hub</span>
          </span>
        </Link>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Link to="/jobs" className="btn btn-outline btn-sm" style={{ borderColor: isActive('/jobs') ? 'var(--accent)' : 'var(--border)' }}>
            🔍 Browse Jobs
          </Link>

          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          ) : (
            <>
              <Link
                to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard'}
                className="btn btn-outline btn-sm"
                style={{ borderColor: isActive('/dashboard') || isActive('/recruiter/dashboard') ? 'var(--accent)' : 'var(--border)' }}
              >
                {user.role === 'recruiter' ? '🏢 Dashboard' : '📋 Dashboard'}
              </Link>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'var(--bg3)', borderRadius:10, border:'1px solid var(--border)' }}>
                <div style={{ width:28, height:28, background:'var(--accent)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize:13, color:'var(--text2)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{color:'var(--danger)', borderColor:'rgba(239,68,68,0.3)'}}>
                Logout
              </button>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg3)',
              color: 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17,
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
