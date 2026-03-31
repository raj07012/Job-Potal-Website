import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/dashboard" element={
            <PrivateRoute role="jobseeker"><JobSeekerDashboard /></PrivateRoute>
          } />
          <Route path="/recruiter/dashboard" element={
            <PrivateRoute role="recruiter"><RecruiterDashboard /></PrivateRoute>
          } />
          <Route path="*" element={
            <div style={{ textAlign:'center', padding:'80px 24px' }}>
              <div style={{ fontSize:64 }}>🔍</div>
              <h2 style={{ marginTop:16 }}>404 — Page Not Found</h2>
              <a href="/" className="btn btn-primary" style={{ marginTop:24, display:'inline-flex' }}>Go Home</a>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}
