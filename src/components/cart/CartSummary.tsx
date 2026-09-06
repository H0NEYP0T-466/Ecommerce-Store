import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { formatPKR } from '../../utils/format';
import './CartSummary.css';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  onCheckout?: () => void;
  disabled?: boolean;
}

export default function CartSummary({
  subtotal,
  deliveryFee,
  total,
  onCheckout,
  disabled = false,
}: CartSummaryProps) {
  return (
    <div className="cart-summary-box">
      <h3 className="summary-title">Order Summary</h3>

      <div className="summary-row">
        <span>Subtotal</span>
        <span>{formatPKR(subtotal)}</span>
      </div>

      <div className="summary-row">
        <span>Estimated Delivery</span>
        <span>{deliveryFee === 0 ? 'FREE' : formatPKR(deliveryFee)}</span>
      </div>

      {deliveryFee === 0 && (
        <p style={{ fontSize: '12px', color: '#0d7c3d', margin: 0 }}>
          ✓ Free shipping applied (Orders over Rs. 3,000)
        </p>
      )}

      <div className="summary-row total">
        <span>Total</span>
        <span>{formatPKR(total)}</span>
      </div>

      {onCheckout ? (
        <Button variant="primary" size="lg" fullWidth onClick={onCheckout} disabled={disabled}>
          Proceed to Checkout
        </Button>
      ) : (
        <Link to="/checkout">
          <Button variant="primary" size="lg" fullWidth disabled={disabled}>
            Proceed to Checkout
          </Button>
        </Link>
      )}
    </div>
  );
}
