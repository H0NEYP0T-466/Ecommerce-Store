import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import './MobileNav.css';

export default function MobileNav() {
  const { cart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const itemCount = cart?.item_count || 0;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <ShoppingBag size={20} />
        <span>Catalog</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={20} />
          {itemCount > 0 && <span className="mobile-nav-badge">{itemCount}</span>}
        </div>
        <span>Cart</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/profile' : '/login'}
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
      </NavLink>
    </nav>
  );
}
