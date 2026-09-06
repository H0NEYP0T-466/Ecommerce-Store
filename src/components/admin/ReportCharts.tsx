import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import type { FinanceReport, OrderReport } from '../../types';
import { formatPKR } from '../../utils/format';

interface ReportChartsProps {
  finance: FinanceReport | null;
  orderReport: OrderReport | null;
}

export default function ReportCharts({ finance, orderReport }: ReportChartsProps) {
  // Prepare product revenue data for chart
  const productData = finance?.top_products?.slice(0, 7).map((p) => ({
    name: p.product_name.length > 18 ? `${p.product_name.substring(0, 16)}...` : p.product_name,
    fullName: p.product_name,
    revenue: p.revenue,
    units: p.units_sold,
  })) || [];

  // Prepare order volume trends
  const volumeData = [
    { name: 'Last Month', orders: orderReport?.last_month_count || 0 },
    { name: 'This Month', orders: orderReport?.this_month_count || 0 },
  ];

  // Revenue comparison
  const revenueTrendData = [
    { name: 'Last Month Est.', amount: Math.round((finance?.this_month_revenue || 0) * 0.85) },
    { name: 'This Month', amount: finance?.this_month_revenue || 0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' }}>
      {/* Top Products Chart */}
      {productData.length > 0 && (
        <div className="admin-section" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Top Products by Revenue (PKR)</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productData}
                margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#4b4b4b', fontSize: 12 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#4b4b4b', fontSize: 12 }}
                  tickFormatter={(val) => `Rs. ${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatPKR(Number(value)), 'Revenue']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #000000',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Side-by-side Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Order Volume Chart */}
        <div className="admin-section" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Monthly Order Velocity</h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                <XAxis dataKey="name" tick={{ fill: '#4b4b4b', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#4b4b4b', fontSize: 12 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} orders`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #000000',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="orders" fill="#000000" radius={[4, 4, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Momentum Chart */}
        <div className="admin-section" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Revenue Momentum</h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData} margin={{ top: 20, right: 30, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                <XAxis dataKey="name" tick={{ fill: '#4b4b4b', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#4b4b4b', fontSize: 12 }}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatPKR(Number(val)), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #000000',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#000000"
                  strokeWidth={3}
                  dot={{ fill: '#000000', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
