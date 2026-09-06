import { useState, useEffect } from 'react';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import { formatPKR, formatDate } from '../../utils/format';
import type { Order } from '../../types';
import './Admin.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'received', label: 'Received' },
  { value: 'packing', label: 'Packing' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
];

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await adminService.getOrders(params);
      setOrders(data.orders);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, search, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast('Order status updated');
      load();
    } catch { toast('Failed to update', 'error'); }
  };

  const handlePaymentChange = async (orderId: string, status: string) => {
    try {
      await adminService.updatePaymentStatus(orderId, status);
      toast('Payment status updated');
      load();
    } catch { toast('Failed to update', 'error'); }
  };

  return (
    <div className="admin-content">
      <h1>Orders ({total})</h1>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Input placeholder="Search orders..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} fullWidth={false} style={{ maxWidth: '250px' }} />
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: '180px' }} />
      </div>

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>{o.order_number}</strong></td>
                  <td>{o.customer_name}<br/><span style={{ fontSize: '11px', color: 'var(--muted-gray)' }}>{o.customer_phone}</span></td>
                  <td>{formatPKR(o.total_amount)}</td>
                  <td>
                    <select
                      value={o.payment_status}
                      onChange={(e) => handlePaymentChange(o.id, e.target.value)}
                      className="inline-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="inline-select"
                    >
                      <option value="received">Received</option>
                      <option value="packing">Packing</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>
                    {o.payment_proof_url && <span title="Has payment proof">📎</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="pagination" style={{ marginTop: '16px' }}>
            <Button variant="chip" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <span>{page} / {Math.ceil(total / 20)}</span>
            <Button variant="chip" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
