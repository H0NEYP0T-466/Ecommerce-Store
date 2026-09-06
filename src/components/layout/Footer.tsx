import { Link } from 'react-router-dom';
import { useSettingsStore } from '../../store/settingsStore';
import './Footer.css';

export default function Footer() {
  const { settings } = useSettingsStore();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-col">
            <div className="footer-brand-wrap">
              <img src="/logo.jpg" alt="Hamid Cloth House" className="footer-logo-img" />
              <h5 className="footer-brand">Hamid Cloth House</h5>
            </div>
            <p className="footer-desc">
              Premium Pakistani clothing for men & women. Quality fabrics, elegant designs, delivered to your doorstep.
            </p>
          </div>

          {/* Shop */}
          <div className="footer-col">
            <h6 className="footer-heading">Shop</h6>
            <Link to="/products" className="footer-link">All Products</Link>
            <Link to="/products?category=mens-clothing" className="footer-link">Men's Collection</Link>
            <Link to="/products?category=womens-clothing" className="footer-link">Women's Collection</Link>
          </div>

          {/* Account */}
          <div className="footer-col">
            <h6 className="footer-heading">Account</h6>
            <Link to="/login" className="footer-link">Log In</Link>
            <Link to="/register" className="footer-link">Register</Link>
            <Link to="/orders" className="footer-link">Track Order</Link>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h6 className="footer-heading">Contact</h6>
            <p className="footer-contact">{settings?.contact_info || 'Main Bazaar, Lahore, Pakistan'}</p>
            {settings?.whatsapp_number && (
              <a href={`https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}`} className="footer-link" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            )}
            <div className="footer-social">
              {settings?.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="social-link">Facebook</a>}
              {settings?.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} Hamid Cloth House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
