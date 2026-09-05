import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import { formatPKR, formatDate } from '../../utils/format';
import type { BankAccount, Order } from '../../types';
import './Admin.css';

export default function AdminPayments() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ bank_name: '', account_name: '', account_number: '', iban: '' });

  const load = async () => {
    try {
      const [accs, pending] = await Promise.all([
        adminService.getBankAccounts(),
        adminService.getPendingPayments({ page_size: 20 }),
      ]);
      setAccounts(accs); setPendingOrders(pending.orders);
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { await adminService.createBankAccount(form); toast('Bank account added'); setShowModal(false); setForm({ bank_name: '', account_name: '', account_number: '', iban: '' }); load(); }
    catch { toast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bank account?')) return;
    try { await adminService.deleteBankAccount(id); toast('Deleted'); load(); }
    catch { toast('Failed', 'error'); }
  };

  return (
    <div className="admin-content">
      <div className="admin-section-header">
        <h1>Payments</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Bank Account</Button>
      </div>

      <div className="admin-section">
        <h3>Bank Accounts</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Bank</th><th>Account Name</th><th>Account #</th><th>IBAN</th><th>Actions</th></tr></thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.bank_name}</strong></td>
                  <td>{a.account_name}</td>
                  <td>{a.account_number}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{a.iban}</td>
                  <td><button className="table-action" onClick={() => handleDelete(a.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h3>Pending Payments ({pendingOrders.length})</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Proof</th><th>Date</th></tr></thead>
            <tbody>
              {pendingOrders.map((o) => (
                <tr key={o.id}>
                  <td><strong>{o.order_number}</strong></td>
                  <td>{o.customer_name}</td>
                  <td>{formatPKR(o.total_amount)}</td>
                  <td>{o.payment_proof_url ? '✅' : '❌'}</td>
                  <td>{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Bank Account" size="sm">
        <div className="admin-form">
          <Input label="Bank Name" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
          <Input label="Account Name" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
          <Input label="Account Number" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
          <Input label="IBAN" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
          <Button variant="primary" onClick={handleCreate}>Add Account</Button>
        </div>
      </Modal>
    </div>
  );
}
