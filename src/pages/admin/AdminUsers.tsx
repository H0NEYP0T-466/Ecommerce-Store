import { useState, useEffect } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import { formatDate } from '../../utils/format';
import type { User } from '../../types';
import './Admin.css';

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const data = await adminService.getUsers({ page, page_size: 20, search: search || undefined });
      setUsers(data.users); setTotal(data.total);
    } catch {}
  };
  useEffect(() => { load(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    try { await adminService.deleteUser(id); toast('User deactivated'); load(); }
    catch { toast('Failed', 'error'); }
  };

  return (
    <div className="admin-content">
      <h1>Users ({total})</h1>
      <div style={{ marginBottom: '24px' }}>
        <Input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} fullWidth={false} style={{ maxWidth: '300px' }} />
      </div>
      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.first_name} {u.last_name}</strong></td>
                  <td>{u.email}</td>
                  <td><Badge variant={u.role === 'admin' ? 'info' : 'default'}>{u.role}</Badge></td>
                  <td><Badge variant={u.is_active ? 'success' : 'error'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td>{formatDate(u.created_at)}</td>
                  <td><button className="table-action" onClick={() => handleDelete(u.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
