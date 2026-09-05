import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import { formatDate } from '../../utils/format';
import type { Promotion } from '../../types';
import './Admin.css';

export default function AdminPromotions() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discount_percent: '10', start_date: '', end_date: '' });

  const load = async () => { try { setPromotions(await adminService.getPromotions()); } catch {} };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await adminService.createPromotion({
        ...form,
        discount_percent: Number(form.discount_percent),
        selected_product_ids: [],
      });
      toast('Promotion created');
      setShowModal(false);
      load();
    } catch { toast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await adminService.deletePromotion(id); toast('Deleted'); load(); }
    catch { toast('Failed', 'error'); }
  };

  return (
    <div className="admin-content">
      <div className="admin-section-header">
        <h1>Promotions ({promotions.length})</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Promotion</Button>
      </div>

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Discount</th><th>Active</th><th>Period</th><th>Actions</th></tr></thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong><br/><span style={{ fontSize: '12px', color: 'var(--muted-gray)' }}>{p.description}</span></td>
                  <td><Badge variant="success">{p.discount_percent}%</Badge></td>
                  <td><Badge variant={p.is_active ? 'success' : 'default'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td>{p.start_date ? `${formatDate(p.start_date)} — ${p.end_date ? formatDate(p.end_date) : 'Ongoing'}` : 'Always'}</td>
                  <td><button className="table-action" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Promotion" size="md">
        <div className="admin-form">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Discount %" type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
          <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <Button variant="primary" onClick={handleCreate}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}
