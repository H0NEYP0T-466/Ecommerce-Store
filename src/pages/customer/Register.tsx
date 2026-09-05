import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import './Auth.css';

export default function Register() {
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '', first_name: '', last_name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(formData);
      toast('Account created! Welcome to Hamid Cloth House.');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <Helmet><title>Sign Up | Hamid Cloth House</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Hamid Cloth House</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-row">
            <Input label="First Name" value={formData.first_name} onChange={(e) => update('first_name', e.target.value)} required />
            <Input label="Last Name" value={formData.last_name} onChange={(e) => update('last_name', e.target.value)} required />
          </div>
          <Input label="Email" type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} required />
          <Input label="Phone (optional)" type="tel" value={formData.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+923001234567" />
          <Input label="Password" type="password" value={formData.password} onChange={(e) => update('password', e.target.value)} required placeholder="At least 6 characters" />
          <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="auth-links">
          <p className="auth-switch">Already have an account? <Link to="/login" className="auth-link-bold">Log In</Link></p>
        </div>
      </div>
    </div>
  );
}
