import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Upload, CheckCircle, Package, Truck, Clock } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { orderService } from '../../services/orders';
import { formatPKR, formatDateTime } from '../../utils/format';
import type { Order } from '../../types';
import './OrderDetail.css';

const STATUS_STEPS = ['received', 'packing', 'dispatched', 'delivered'];
const STATUS_ICONS = { received: Clock, packing: Package, dispatched: Truck, delivered: CheckCircle };

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderService.getOrder(id).then(setOrder).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !id) return;
    setUploading(true);
    try {
      await orderService.uploadPaymentProof(id, e.target.files[0]);
      toast('Payment proof uploaded!');
      const updated = await orderService.getOrder(id);
      setOrder(updated);
    } catch { toast('Upload failed', 'error'); }
    setUploading(false);
  };

  if (loading) return <div className="od-page container"><p>Loading...</p></div>;
  if (!order) return <div className="od-page container"><h2>Order not found</h2></div>;

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="od-page container">
      <Helmet><title>Order {order.order_number} | Hamid Cloth House</title></Helmet>

      <div className="od-header">
        <div>
          <h1>Order {order.order_number}</h1>
          <p className="od-date">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'dispatched' ? 'default' : 'info'}>{order.status}</Badge>
      </div>

      {/* Status Tracker */}
      <div className="od-tracker">
        {STATUS_STEPS.map((step, i) => {
          const Icon = STATUS_ICONS[step as keyof typeof STATUS_ICONS];
          const isComplete = i <= currentStepIdx;
          return (
            <div key={step} className={`tracker-step ${isComplete ? 'complete' : ''}`}>
              <div className="tracker-icon"><Icon size={20} /></div>
              <span className="tracker-label">{step}</span>
              {i < STATUS_STEPS.length - 1 && <div className={`tracker-line ${i < currentStepIdx ? 'complete' : ''}`} />}
            </div>
          );
        })}
      </div>

      <div className="od-grid">
        <div>
          <h4>Items</h4>
          <div className="od-items">
            {order.items.map((item, i) => (
              <div key={i} className="od-item">
                <div className="od-item-info">
                  <strong>{item.product_name}</strong>
                  <span>{item.color}{item.size ? ` / ${item.size}` : ''} × {item.quantity}</span>
                </div>
                <span>{formatPKR(item.subtotal)}</span>
              </div>
            ))}
            <div className="od-item od-total">
              <strong>Total</strong>
              <strong>{formatPKR(order.total_amount)}</strong>
            </div>
          </div>
        </div>

        <div>
          <h4>Details</h4>
          <div className="od-details">
            <div className="od-detail"><span>Name</span><span>{order.customer_name}</span></div>
            <div className="od-detail"><span>Email</span><span>{order.customer_email}</span></div>
            <div className="od-detail"><span>Phone</span><span>{order.customer_phone}</span></div>
            <div className="od-detail"><span>Address</span><span>{order.customer_address}</span></div>
            <div className="od-detail"><span>Payment</span><Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>{order.payment_status}</Badge></div>
            {order.payment_method && <div className="od-detail"><span>Via</span><span>{order.payment_method}</span></div>}
          </div>

          {!order.payment_proof_url && order.payment_status === 'pending' && (
            <div className="od-upload">
              <p>Upload payment proof screenshot:</p>
              <label className="upload-btn">
                <Upload size={16} /> {uploading ? 'Uploading...' : 'Choose File'}
                <input type="file" accept="image/*" onChange={handleUploadProof} hidden disabled={uploading} />
              </label>
            </div>
          )}
          {order.payment_proof_url && <p className="od-proof-msg">✓ Payment proof uploaded</p>}
        </div>
      </div>
    </div>
  );
}
