import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import './Navbar.css';
import type { Category } from '../../types';
import api from '../../services/api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/api/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const cartCount = cart?.item_count || 0;

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Hamid</span>
          <span className="logo-sub">Cloth House</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-nav">
          <Link to="/products" className="nav-link">Shop All</Link>
          {categories.filter(c => !c.parent_id).map((cat) => (
            <div key={cat.id} className="nav-dropdown">
              <Link to={`/products?category=${cat.slug}`} className="nav-link">
                {cat.name} <ChevronDown size={14} />
              </Link>
              {cat.children && cat.children.length > 0 && (
                <div className="dropdown-menu">
                  {cat.children.map((sub) => (
                    <Link key={sub.id} to={`/products?category=${sub.slug}`} className="dropdown-item">
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="nav-icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <Search size={20} />
          </button>

          <Link to="/cart" className="nav-icon-btn cart-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button className="nav-icon-btn" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="Account">
                <User size={20} />
              </button>
              {userMenuOpen && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <p className="user-menu-name">{user?.first_name} {user?.last_name}</p>
                    <p className="user-menu-email">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>My Profile</Link>
                  <Link to="/orders" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button className="user-menu-item user-menu-logout" onClick={handleLogout}>Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-login-btn">Log In</Link>
          )}

          <button className="nav-icon-btn mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="search-bar">
          <form className="search-bar-inner container" onSubmit={handleSearch}>
            <Search size={20} className="search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link to="/products" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Shop All</Link>
            {categories.filter(c => !c.parent_id).map((cat) => (
              <div key={cat.id}>
                <Link to={`/products?category=${cat.slug}`} className="mobile-nav-link" onClick={() => setMobileOpen(false)}>{cat.name}</Link>
                {cat.children?.map((sub) => (
                  <Link key={sub.id} to={`/products?category=${sub.slug}`} className="mobile-nav-sublink" onClick={() => setMobileOpen(false)}>{sub.name}</Link>
                ))}
              </div>
            ))}
            {!isAuthenticated && (
              <Link to="/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Log In</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
