import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { authService } from '../../services/auth';
import './Auth.css';

export default function ResetPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast('Invalid or missing reset token', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      toast('Password reset successfully');
    } catch {
      toast('Reset failed. The link may have expired.', 'error');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <>
        <Helmet><title>Reset Password | Hamid Cloth House</title></Helmet>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Invalid Link</h1>
              <p>This password reset link is invalid or has expired.</p>
            </div>
            <Link to="/forgot-password">
              <Button variant="primary" fullWidth>Request a New Link</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password | Hamid Cloth House</title>
        <meta name="description" content="Set a new password for your Hamid Cloth House account." />
      </Helmet>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <Lock size={28} />
            <h1>Set New Password</h1>
            <p>Choose a strong password for your account.</p>
          </div>

          {done ? (
            <div className="auth-success">
              <div className="auth-success-icon">
                <CheckCircle size={32} />
              </div>
              <h3>Password Reset!</h3>
              <p>Your password has been changed. You can now sign in with your new password.</p>
              <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoFocus
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
              <Button variant="primary" type="submit" disabled={loading} fullWidth>
                {loading ? 'Resetting...' : 'Reset Password'}
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
