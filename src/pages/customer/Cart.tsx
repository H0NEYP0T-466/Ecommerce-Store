import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatPKR, getImageUrl } from '../../utils/format';
import './Cart.css';

export default function Cart() {
  const { cart, loadCart, updateQuantity, removeItem, clearCart, isLoading } = useCartStore();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) loadCart();
  }, [isAuthenticated]);

  const handleUpdateQty = async (varId: string, newQty: number) => {
    try {
      await updateQuantity(varId, newQty);
    } catch (err: any) {
      toast(err.response?.data?.detail || 'Failed to update quantity', 'error');
    }
  };

  const handleRemove = async (varId: string) => {
    try {
      await removeItem(varId);
      toast('Item removed from cart');
    } catch (err: any) {
      toast(err.response?.data?.detail || 'Failed to remove item', 'error');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast('Cart cleared');
    } catch (err: any) {
      toast(err.response?.data?.detail || 'Failed to clear cart', 'error');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="cart-page container">
        <Helmet><title>Cart | Hamid Cloth House</title></Helmet>
        <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <img src="/logo-anim.gif" alt="Loading" style={{ width: '84px', borderRadius: '8px', background: '#000' }} />
          <p style={{ color: 'var(--muted-gray)' }}>Loading your cart...</p>
        </div>
      </div>
    );
  }

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

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
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

  const subtotal = Number(cart.total) || 0;
  const delivery = subtotal >= 3000 ? 0 : 200;
  const grandTotal = subtotal < 3000 ? subtotal + 200 : subtotal;
  const itemCount = cart.item_count || cart.items.length;

  return (
    <div className="cart-page container">
      <Helmet><title>{`Cart (${itemCount}) | Hamid Cloth House`}</title></Helmet>
      <h1>Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item, idx) => (
            <div key={item.product_variation_id || idx} className="cart-item">
              <div className="cart-item-image">
                <img src={getImageUrl(item.image || '')} alt={item.product_name || 'Product'} />
              </div>
              <div className="cart-item-info">
                <h5 className="cart-item-name">{item.product_name || 'Product'}</h5>
                <p className="cart-item-variant">{item.color || ''}{item.size ? ` / ${item.size}` : ''}</p>
                <p className="cart-item-price">{formatPKR(item.unit_price)}</p>
              </div>
              <div className="cart-item-actions">
                <div className="cart-qty">
                  <button onClick={() => handleUpdateQty(item.product_variation_id, (item.quantity || 1) - 1)} disabled={(item.quantity || 1) <= 1}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => handleUpdateQty(item.product_variation_id, (item.quantity || 1) + 1)} disabled={(item.quantity || 1) >= (item.stock_available ?? 999)}>
                    <Plus size={14} />
                  </button>
                </div>
                <p className="cart-item-subtotal">{formatPKR(item.subtotal)}</p>
                <button className="cart-item-remove" onClick={() => handleRemove(item.product_variation_id)} aria-label="Remove">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button className="clear-cart-btn" onClick={handleClear}>Clear Cart</button>
        </div>

        <div className="cart-summary">
          <h4>Order Summary</h4>
          <div className="summary-row">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>{delivery === 0 ? 'Free' : formatPKR(200)}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPKR(grandTotal)}</span>
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
