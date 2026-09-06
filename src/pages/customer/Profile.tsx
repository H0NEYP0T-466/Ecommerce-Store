import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { User as UserIcon, Mail, Lock, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';
import './Profile.css';

export default function Profile() {
  const { toast } = useToast();
  const { user, loadUser } = useAuthStore();

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast('First name is required', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await authService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      });
      await loadUser();
      toast('Profile updated successfully');
    } catch {
      toast('Failed to update profile', 'error');
    }
    setSavingProfile(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast('Enter your current password', 'error');
      return;
    }
    if (newPassword.length < 6) {
      toast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast('Password changed successfully');
    } catch {
      toast('Failed to change password. Check your current password.', 'error');
    }
    setSavingPassword(false);
  };

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>My Profile | Hamid Cloth House</title>
        <meta name="description" content="Manage your Hamid Cloth House account profile and password." />
      </Helmet>

      <div className="profile-page container">
        <h1 className="profile-title">My Profile</h1>

        <div className="profile-grid">
          {/* ── Profile Info ── */}
          <section className="profile-section">
            <div className="profile-section-header">
              <UserIcon size={20} />
              <h2>Personal Information</h2>
            </div>
            <form onSubmit={handleProfileSave} className="profile-form">
              <div className="profile-form-row">
                <Input
                  label="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                />
              </div>
              <div className="profile-form-row">
                <div className="input-group input-group--full">
                  <label className="input-label">
                    <Mail size={14} /> Email
                  </label>
                  <div className="profile-email">{user.email}</div>
                </div>
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                />
              </div>
              <div className="profile-form-actions">
                <Button variant="primary" type="submit" disabled={savingProfile}>
                  <Save size={16} />
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </section>

          {/* ── Password Change ── */}
          <section className="profile-section">
            <div className="profile-section-header">
              <Lock size={20} />
              <h2>Change Password</h2>
            </div>
            <form onSubmit={handlePasswordChange} className="profile-form">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
              <div className="profile-form-actions">
                <Button variant="primary" type="submit" disabled={savingPassword}>
                  <Lock size={16} />
                  {savingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </section>
        </div>

        {/* ── Account Info ── */}
        <section className="profile-section profile-meta">
          <div className="profile-meta-item">
            <span className="profile-meta-label">Member since</span>
            <span className="profile-meta-value">
              {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="profile-meta-item">
            <span className="profile-meta-label">Account Type</span>
            <span className="profile-meta-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
        </section>
      </div>
    </>
  );
}
