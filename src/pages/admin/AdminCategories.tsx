/* Placeholder admin pages — each follows the same pattern */
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import type { Category } from '../../types';
import './Admin.css';

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [parentId, setParentId] = useState('');

  const load = async () => {
    try { const data = await adminService.getCategories(); setCategories(data); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await adminService.createCategory({ name: newName, parent_id: parentId || undefined });
      toast('Category created');
      setShowModal(false); setNewName(''); setParentId('');
      load();
    } catch { toast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this category?')) return;
    try { await adminService.deleteCategory(id); toast('Category deactivated'); load(); }
    catch { toast('Failed', 'error'); }
  };

  return (
    <div className="admin-content">
      <div className="admin-section-header">
        <h1>Categories</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Category</Button>
      </div>

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Parent</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.slug}</td>
                  <td>{c.parent_id || '—'}</td>
                  <td><Badge variant={c.is_active ? 'success' : 'default'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td><button className="table-action" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Category" size="sm">
        <div className="admin-form">
          <Input label="Category Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input label="Parent ID (optional)" value={parentId} onChange={(e) => setParentId(e.target.value)} placeholder="Leave empty for top-level" />
          <Button variant="primary" onClick={handleCreate}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}
