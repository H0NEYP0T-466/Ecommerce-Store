import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { adminService } from '../../services/admin';
import { formatPKR, formatDate } from '../../utils/format';
import type { FinanceReport, OrderReport } from '../../types';
import './Admin.css';

export default function AdminDashboard() {
  const [finance, setFinance] = useState<FinanceReport | null>(null);
  const [orderReport, setOrderReport] = useState<OrderReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [fin, ord] = await Promise.all([
          adminService.getFinanceReport(),
          adminService.getOrderReport(),
        ]);
        setFinance(fin);
        setOrderReport(ord);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const stats = finance ? [
    { label: 'Total Revenue', value: formatPKR(finance.total_revenue), icon: DollarSign, change: '' },
    { label: 'Total Orders', value: finance.total_orders.toString(), icon: ShoppingBag, change: '' },
    { label: 'This Month Revenue', value: formatPKR(finance.this_month_revenue), icon: TrendingUp, change: '' },
    { label: 'Avg Order Value', value: formatPKR(finance.average_order_value), icon: Package, change: '' },
  ] : [];

  return (
    <>
      <Helmet><title>Admin Dashboard | Hamid Cloth House</title></Helmet>
      <div className="admin-content">
        <h1>Dashboard</h1>

        {/* Stats Grid */}
        <div className="stats-grid">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-card skeleton-stat" />
            ))
          ) : stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon"><stat.icon size={22} /></div>
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="admin-section">
          <h3>Recent Orders</h3>
          {orderReport && orderReport.recent_orders.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orderReport.recent_orders.map((order: any) => (
                    <tr key={order.id}>
                      <td><strong>{order.order_number}</strong></td>
                      <td>{order.customer_name}</td>
                      <td>{formatPKR(order.total_amount)}</td>
                      <td><Badge variant={order.status === 'delivered' ? 'success' : order.status === 'dispatched' ? 'default' : 'info'}>{order.status}</Badge></td>
                      <td>{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No orders yet</p>
          )}
        </div>

        {/* Top Products */}
        {finance && finance.top_products.length > 0 && (
          <div className="admin-section">
            <h3>Top Products</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {finance.top_products.map((p) => (
                    <tr key={p.rank}>
                      <td>{p.rank}</td>
                      <td><strong>{p.product_name}</strong></td>
                      <td>{p.units_sold}</td>
                      <td>{formatPKR(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
