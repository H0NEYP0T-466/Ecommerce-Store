import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { authService } from '../../services/auth';
import './Auth.css';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast('Please enter your email address', 'error');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast('Password reset email sent');
    } catch {
      toast('Failed to send reset email. Please check your email address.', 'error');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | Hamid Cloth House</title>
        <meta name="description" content="Reset your Hamid Cloth House account password." />
      </Helmet>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Forgot Password</h1>
            <p>Enter your email and we'll send you a reset link.</p>
          </div>

          {sent ? (
            <div className="auth-success">
              <div className="auth-success-icon">
                <Mail size={32} />
              </div>
              <h3>Check Your Email</h3>
              <p>
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and spam folder.
              </p>
              <Link to="/login">
                <Button variant="primary" fullWidth>
                  <ArrowLeft size={16} /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
              />
              <Button variant="primary" type="submit" disabled={loading} fullWidth>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <div className="auth-footer">
                <Link to="/login" className="auth-link">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
