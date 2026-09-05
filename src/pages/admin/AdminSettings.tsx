import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import type { SiteSettings } from '../../types';
import './Admin.css';

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getSettings().then(setSettings).catch(() => {});
  }, []);

  const update = (key: string, value: string | boolean) => {
    if (settings) setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast('Settings saved');
    } catch { toast('Failed', 'error'); }
    setSaving(false);
  };

  if (!settings) return <div className="admin-content"><p>Loading...</p></div>;

  return (
    <div className="admin-content">
      <h1>Site Settings</h1>
      <div className="admin-section">
        <div className="admin-form">
          <Input label="Display Name" value={settings.display_name} onChange={(e) => update('display_name', e.target.value)} />
          <Input label="Contact Info" value={settings.contact_info} onChange={(e) => update('contact_info', e.target.value)} />
          <Input label="WhatsApp Number" value={settings.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} />
          <Input label="Facebook URL" value={settings.facebook_url} onChange={(e) => update('facebook_url', e.target.value)} />
          <Input label="Instagram URL" value={settings.instagram_url} onChange={(e) => update('instagram_url', e.target.value)} />
          <Input label="YouTube URL" value={settings.youtube_url} onChange={(e) => update('youtube_url', e.target.value)} />
          <div className="admin-form-actions">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
