import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, ChevronRight } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { orderService } from '../../services/orders';
import { formatPKR, formatDate, getStatusColor } from '../../utils/format';
import type { Order } from '../../types';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data.orders);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'received': return 'info';
      case 'packing': return 'warning';
      case 'dispatched': return 'default';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="orders-page container">
      <Helmet><title>My Orders | Hamid Cloth House</title></Helmet>
      <h1>My Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <Package size={48} strokeWidth={1} />
          <h3>No orders yet</h3>
          <p>When you place orders, they'll appear here.</p>
          <Link to="/products"><button className="btn btn--primary btn--lg">Shop Now</button></Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-number">{order.order_number}</span>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status) as any}>{order.status}</Badge>
              </div>
              <div className="order-card-body">
                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item, i) => (
                    <span key={i} className="order-item-name">{item.product_name} ×{item.quantity}</span>
                  ))}
                  {order.items.length > 3 && <span className="order-more">+{order.items.length - 3} more</span>}
                </div>
                <div className="order-card-footer">
                  <span className="order-total">{formatPKR(order.total_amount)}</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
