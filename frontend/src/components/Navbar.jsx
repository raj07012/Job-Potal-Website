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

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };
  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  const handleToggleTheme = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <nav
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <div
        className="page-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          onClick={closeMenu}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: 'var(--accent)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontFamily: 'Syne,sans-serif',
              fontWeight: 800,
              fontSize: 20,
              color: 'var(--text)',
            }}
          >
            Hire<span style={{ color: 'var(--accent)' }}>Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          className="navbar-desktop"
          style={{ alignItems: 'center', gap: 8 }}
        >
          <Link
            to="/jobs"
            className="btn btn-outline btn-sm"
            style={{
              borderColor: isActive('/jobs')
                ? 'var(--accent)'
                : 'var(--border)',
            }}
          >
            🔍 Browse Jobs
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                to={
                  user.role === 'recruiter'
                    ? '/recruiter/dashboard'
                    : '/dashboard'
                }
                className="btn btn-outline btn-sm"
                style={{
                  borderColor:
                    isActive('/dashboard') || isActive('/recruiter/dashboard')
                      ? 'var(--accent)'
                      : 'var(--border)',
                }}
              >
                {user.role === 'recruiter' ? '🏢 Dashboard' : '📋 Dashboard'}
              </Link>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  background: 'var(--bg3)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: 'var(--accent)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--text2)',
                    maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{
                  color: 'var(--danger)',
                  borderColor: 'rgba(239,68,68,0.3)',
                }}
              >
                Logout
              </button>
            </>
          )}
          <button
            onClick={handleToggleTheme}
            title={
              theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
            }
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg3)',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="navbar-mobile" style={{ alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleToggleTheme}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg3)',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg3)',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeMenu}
            style={{
              position: 'fixed',
              inset: 0,
              top: 64,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 98,
            }}
          />

          {/* Dropdown Panel */}
          <div
            style={{
              position: 'absolute',
              top: 64,
              left: 12,
              right: 12,
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              zIndex: 99,
            }}
          >
            {/* User info (only if logged in) */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg3)',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    background: 'var(--accent)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--text)',
                    }}
                  >
                    {user.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text3)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div style={{ padding: '8px 0' }}>
              <Link
                to="/jobs"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--bg3)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                  🔍
                </span>
                Browse Jobs
              </Link>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      color: 'var(--text)',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--bg3)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <span
                      style={{ fontSize: 18, width: 24, textAlign: 'center' }}
                    >
                      🔐
                    </span>
                    Login
                  </Link>

                  <div style={{ padding: '8px 16px' }}>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      🚀 Sign Up Free
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to={
                      user.role === 'recruiter'
                        ? '/recruiter/dashboard'
                        : '/dashboard'
                    }
                    onClick={closeMenu}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      color: 'var(--text)',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--bg3)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <span
                      style={{ fontSize: 18, width: 24, textAlign: 'center' }}
                    >
                      {user.role === 'recruiter' ? '🏢' : '📋'}
                    </span>
                    Dashboard
                  </Link>

                  <div
                    style={{
                      height: 1,
                      background: 'var(--border)',
                      margin: '4px 0',
                    }}
                  />

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        'rgba(239,68,68,0.08)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <span
                      style={{ fontSize: 18, width: 24, textAlign: 'center' }}
                    >
                      🚪
                    </span>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
