import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import type { Slider } from '../../types';
import './Admin.css';

export default function AdminSliders() {
  const { toast } = useToast();
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ image_url: '', title: '', subtitle: '', link_url: '' });

  const load = async () => { try { setSliders(await adminService.getSliders()); } catch {} };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { await adminService.createSlider(form); toast('Slider created'); setShowModal(false); setForm({ image_url: '', title: '', subtitle: '', link_url: '' }); load(); }
    catch { toast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slider?')) return;
    try { await adminService.deleteSlider(id); toast('Deleted'); load(); }
    catch { toast('Failed', 'error'); }
  };

  return (
    <div className="admin-content">
      <div className="admin-section-header">
        <h1>Sliders ({sliders.length})</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Slider</Button>
      </div>

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Image</th><th>Title</th><th>Subtitle</th><th>Link</th><th>Actions</th></tr></thead>
            <tbody>
              {sliders.map((s) => (
                <tr key={s.id}>
                  <td><img src={s.image_url} alt="" style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }} /></td>
                  <td><strong>{s.title || '—'}</strong></td>
                  <td>{s.subtitle || '—'}</td>
                  <td>{s.link_url || '—'}</td>
                  <td><button className="table-action" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Slider" size="md">
        <div className="admin-form">
          <Input label="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <Input label="Link URL" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
          <Button variant="primary" onClick={handleCreate}>Create Slider</Button>
        </div>
      </Modal>
    </div>
  );
}
