import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPKR, getImageUrl } from '../../utils/format';
import './Cart.css';

export default function Cart() {
  const { cart, loadCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) loadCart();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="cart-page container">
        <Helmet><title>Cart | Hamid Cloth House</title></Helmet>
        <div className="cart-empty">
          <ShoppingBag size={48} strokeWidth={1} />
          <h2>Please log in to view your cart</h2>
          <Link to="/login"><Button variant="primary" size="lg">Log In</Button></Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page container">
        <Helmet><title>Cart | Hamid Cloth House</title></Helmet>
        <div className="cart-empty">
          <ShoppingBag size={48} strokeWidth={1} />
          <h2>Your cart is empty</h2>
          <p>Browse our collection and add items to your cart.</p>
          <Link to="/products"><Button variant="primary" size="lg">Shop Now</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <Helmet><title>Cart ({cart.item_count}) | Hamid Cloth House</title></Helmet>
      <h1>Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.product_variation_id} className="cart-item">
              <div className="cart-item-image">
                <img src={getImageUrl(item.image || '')} alt={item.product_name} />
              </div>
              <div className="cart-item-info">
                <h5 className="cart-item-name">{item.product_name}</h5>
                <p className="cart-item-variant">{item.color}{item.size ? ` / ${item.size}` : ''}</p>
                <p className="cart-item-price">{formatPKR(item.unit_price)}</p>
              </div>
              <div className="cart-item-actions">
                <div className="cart-qty">
                  <button onClick={() => updateQuantity(item.product_variation_id, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_variation_id, item.quantity + 1)} disabled={item.quantity >= item.stock_available}>
                    <Plus size={14} />
                  </button>
                </div>
                <p className="cart-item-subtotal">{formatPKR(item.subtotal)}</p>
                <button className="cart-item-remove" onClick={() => removeItem(item.product_variation_id)} aria-label="Remove">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
        </div>

        <div className="cart-summary">
          <h4>Order Summary</h4>
          <div className="summary-row">
            <span>Subtotal ({cart.item_count} items)</span>
            <span>{formatPKR(cart.total)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>{cart.total >= 3000 ? 'Free' : formatPKR(200)}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPKR(cart.total < 3000 ? cart.total + 200 : cart.total)}</span>
          </div>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ArrowRight size={18} />
          </Button>
          <p className="summary-note">Free delivery on orders above Rs. 3,000</p>
        </div>
      </div>
    </div>
  );
}
