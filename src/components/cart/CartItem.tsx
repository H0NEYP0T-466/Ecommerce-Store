import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPKR, getImageUrl } from '../../utils/format';
import type { CartItem as CartItemType } from '../../types';
import './CartItem.css';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (variationId: string, qty: number) => void;
  onRemove: (variationId: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="cart-item-card">
      <img
        src={getImageUrl(item.image || '')}
        alt={item.product_name}
        className="cart-item-image"
      />

      <div className="cart-item-info">
        <h4 className="cart-item-title">{item.product_name}</h4>
        <span className="cart-item-variant">
          {item.color} {item.size ? `• Size: ${item.size}` : ''}
        </span>
        <span style={{ fontWeight: 600, fontSize: '14px', marginTop: '4px' }}>
          {formatPKR(item.unit_price)}
        </span>
      </div>

      <div className="cart-item-actions">
        <div className="qty-stepper">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.product_variation_id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span>{item.quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.product_variation_id, item.quantity + 1)}
            disabled={item.quantity >= item.stock_available}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.product_variation_id)}
          className="remove-btn"
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
