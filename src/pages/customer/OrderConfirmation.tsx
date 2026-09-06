import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Package, MessageCircle, ShoppingBag } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useSettingsStore } from '../../store/settingsStore';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';
  const { settings } = useSettingsStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const whatsappLink = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I just placed order ${orderNumber}. Please confirm.`)}`
    : '#';

  return (
    <>
      <Helmet>
        <title>Order Confirmed | Hamid Cloth House</title>
      </Helmet>

      <div className="confirmation-page">
        <div className={`confirmation-card ${showConfetti ? 'with-confetti' : ''}`}>
          <div className="confirmation-icon">
            <CheckCircle size={56} />
          </div>

          <h1 className="confirmation-title">Order Placed!</h1>
          <p className="confirmation-subtitle">
            Thank you for shopping with us. Your order has been received.
          </p>

          {orderNumber && (
            <div className="confirmation-order-number">
              <span className="confirmation-label">Order Number</span>
              <span className="confirmation-value">{orderNumber}</span>
            </div>
          )}

          <div className="confirmation-steps">
            <div className="confirmation-step">
              <div className="confirmation-step-num">1</div>
              <div>
                <strong>Upload Payment Proof</strong>
                <p>Transfer the amount to our bank account and upload the receipt.</p>
              </div>
            </div>
            <div className="confirmation-step">
              <div className="confirmation-step-num">2</div>
              <div>
                <strong>We Verify & Pack</strong>
                <p>Once verified, we'll start packing your order.</p>
              </div>
            </div>
            <div className="confirmation-step">
              <div className="confirmation-step-num">3</div>
              <div>
                <strong>Fast Delivery</strong>
                <p>Your order will be dispatched and delivered to your doorstep.</p>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to={`/orders`}>
              <Button variant="primary" size="lg">
                <Package size={18} /> View My Orders
              </Button>
            </Link>

            {settings?.whatsapp_number && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg">
                  <MessageCircle size={18} /> WhatsApp Us
                </Button>
              </a>
            )}

            <Link to="/products">
              <Button variant="chip">
                <ShoppingBag size={16} /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
