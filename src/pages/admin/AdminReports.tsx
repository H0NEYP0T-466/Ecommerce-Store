import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { adminService } from '../../services/admin';
import { formatPKR } from '../../utils/format';
import type { FinanceReport, OrderReport } from '../../types';
import ReportCharts from '../../components/admin/ReportCharts';
import './Admin.css';

export default function AdminReports() {
  const [finance, setFinance] = useState<FinanceReport | null>(null);
  const [orderReport, setOrderReport] = useState<OrderReport | null>(null);

  useEffect(() => {
    adminService.getFinanceReport().then(setFinance).catch(() => {});
    adminService.getOrderReport().then(setOrderReport).catch(() => {});
  }, []);

  return (
    <div className="admin-content">
      <h1>Reports</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={22} /></div>
          <div><p className="stat-label">Total Revenue</p><p className="stat-value">{finance ? formatPKR(finance.total_revenue) : '—'}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ShoppingBag size={22} /></div>
          <div><p className="stat-label">Total Orders</p><p className="stat-value">{finance?.total_orders ?? '—'}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={22} /></div>
          <div><p className="stat-label">This Month</p><p className="stat-value">{finance ? formatPKR(finance.this_month_revenue) : '—'}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ShoppingBag size={22} /></div>
          <div><p className="stat-label">Avg Order Value</p><p className="stat-value">{finance ? formatPKR(finance.average_order_value) : '—'}</p></div>
        </div>
      </div>

      {orderReport && (
        <div className="admin-section">
          <h3>Order Volume</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="stat-card"><div><p className="stat-label">This Month</p><p className="stat-value">{orderReport.this_month_count}</p></div></div>
            <div className="stat-card"><div><p className="stat-label">Last Month</p><p className="stat-value">{orderReport.last_month_count}</p></div></div>
            <div className="stat-card"><div><p className="stat-label">All Time</p><p className="stat-value">{orderReport.total_count}</p></div></div>
          </div>
        </div>
      )}

      {finance && finance.top_products.length > 0 && (
        <div className="admin-section">
          <h3>Top Selling Products</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Rank</th><th>Product</th><th>Category</th><th>Units</th><th>Revenue</th></tr></thead>
              <tbody>
                {finance.top_products.map((p) => (
                  <tr key={p.rank}>
                    <td>#{p.rank}</td>
                    <td><strong>{p.product_name}</strong></td>
                    <td>{p.category_name || '—'}</td>
                    <td>{p.units_sold}</td>
                    <td>{formatPKR(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts */}
      <ReportCharts finance={finance} orderReport={orderReport} />
    </div>
  );
}
