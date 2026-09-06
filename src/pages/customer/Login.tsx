import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import './Auth.css';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      toast('Welcome back!');
      if (loggedInUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (err.message === 'Network Error') {
        setError('Unable to reach server on port 8015. Please ensure backend is running.');
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Log In | Hamid Cloth House</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-title">Log In</h1>
        <p className="auth-subtitle">Welcome back to Hamid Cloth House</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" />
          <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          <p className="auth-switch">Don't have an account? <Link to="/register" className="auth-link-bold">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
}
