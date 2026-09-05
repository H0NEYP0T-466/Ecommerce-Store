import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orders';
import { formatPKR, getImageUrl } from '../../utils/format';
import type { BankAccount } from '../../types';
import api from '../../services/api';
import './Checkout.css';

export default function Checkout() {
  const { cart, loadCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    payment_method: '',
    transaction_id: '',
    additional_notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
    api.get('/api/payments/bank-accounts').then(r => setBankAccounts(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: `${user.first_name} ${user.last_name}`,
        customer_email: user.email,
        customer_phone: user.phone || '',
      }));
    }
  }, [user]);

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.customer_address) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const order = await orderService.placeOrder(formData);
      toast('Order placed successfully!');
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      toast(err.response?.data?.detail || 'Failed to place order', 'error');
    }
    setLoading(false);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-page container">
        <Helmet><title>Checkout | Hamid Cloth House</title></Helmet>
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  const deliveryFee = cart.total >= 3000 ? 0 : 200;
  const grandTotal = cart.total + deliveryFee;

  return (
    <div className="checkout-page container">
      <Helmet><title>Checkout | Hamid Cloth House</title></Helmet>
      <h1>Checkout</h1>

      <form className="checkout-layout" onSubmit={handleSubmit}>
        <div className="checkout-form">
          <section className="checkout-section">
            <h4>Contact Information</h4>
            <Input label="Full Name *" value={formData.customer_name} onChange={(e) => update('customer_name', e.target.value)} required />
            <Input label="Email *" type="email" value={formData.customer_email} onChange={(e) => update('customer_email', e.target.value)} required />
            <Input label="Phone Number *" type="tel" value={formData.customer_phone} onChange={(e) => update('customer_phone', e.target.value)} required placeholder="+923001234567" />
          </section>

          <section className="checkout-section">
            <h4>Delivery Address</h4>
            <Textarea label="Full Address *" value={formData.customer_address} onChange={(e) => update('customer_address', e.target.value)} required placeholder="House #, Street, City, Province" />
          </section>

          <section className="checkout-section">
            <h4>Payment Method</h4>
            <p className="checkout-note">Transfer the total amount to one of the following bank accounts and enter the transaction ID below.</p>
            <div className="bank-accounts-list">
              {bankAccounts.map((bank) => (
                <label key={bank.id} className={`bank-option ${formData.payment_method === bank.bank_name ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value={bank.bank_name}
                    checked={formData.payment_method === bank.bank_name}
                    onChange={(e) => update('payment_method', e.target.value)}
                  />
                  <div className="bank-info">
                    <strong>{bank.bank_name}</strong>
                    <span>A/C: {bank.account_number}</span>
                    <span>Name: {bank.account_name}</span>
                    <span className="bank-iban">IBAN: {bank.iban}</span>
                  </div>
                </label>
              ))}
            </div>
            <Input label="Transaction ID (optional)" value={formData.transaction_id} onChange={(e) => update('transaction_id', e.target.value)} placeholder="Enter transaction reference" />
          </section>

          <section className="checkout-section">
            <Textarea label="Additional Notes (optional)" value={formData.additional_notes} onChange={(e) => update('additional_notes', e.target.value)} placeholder="Any special instructions..." />
          </section>
        </div>

        <div className="checkout-summary">
          <h4>Order Summary</h4>
          <div className="checkout-items">
            {cart.items.map((item) => (
              <div key={item.product_variation_id} className="checkout-item">
                <img src={getImageUrl(item.image || '')} alt={item.product_name} className="checkout-item-img" />
                <div className="checkout-item-info">
                  <p className="checkout-item-name">{item.product_name}</p>
                  <p className="checkout-item-variant">{item.color}{item.size ? ` / ${item.size}` : ''} × {item.quantity}</p>
                </div>
                <span className="checkout-item-price">{formatPKR(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-totals">
            <div className="checkout-row"><span>Subtotal</span><span>{formatPKR(cart.total)}</span></div>
            <div className="checkout-row"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : formatPKR(deliveryFee)}</span></div>
            <div className="checkout-divider" />
            <div className="checkout-row checkout-grand"><span>Total</span><span>{formatPKR(grandTotal)}</span></div>
          </div>
          <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading}>
            {loading ? 'Placing Order...' : `Place Order — ${formatPKR(grandTotal)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
