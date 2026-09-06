import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Star, Image,
  Tag, CreditCard, Settings, BarChart3, Bell, LogOut, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import wsService from '../../services/ws';
import './Admin.css';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/categories', label: 'Categories', icon: Tag },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/sliders', label: 'Sliders', icon: Image },
  { path: '/admin/promotions', label: 'Promotions', icon: Tag },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { unreadCount, setUnreadCount, incrementUnread } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    // Connect WebSocket for notifications
    wsService.connect();
    const unsub = wsService.subscribe((msg) => {
      if (msg.type === 'unread_count') setUnreadCount(msg.count || 0);
      if (msg.type === 'notification') incrementUnread();
    });
    return () => { unsub(); wsService.disconnect(); };
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      <Helmet><title>Admin | Hamid Cloth House</title></Helmet>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <img src="/logo.jpg" alt="Hamid Cloth House" className="sidebar-logo-img" />
            <div className="sidebar-logo-text-wrap">
              <span className="sidebar-logo-text">Hamid</span>
              <span className="sidebar-logo-sub">Admin</span>
            </div>
          </Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.label === 'Orders' && unreadCount > 0 && (
                  <span className="sidebar-badge">{unreadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user?.first_name}</span>
            <span className="sidebar-user-role">Admin</span>
          </div>
          <button className="sidebar-link" onClick={handleLogout}>
            <LogOut size={18} /><span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="topbar-menu" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="topbar-right">
            <button className="topbar-notif" onClick={() => { wsService.markAllRead(); setUnreadCount(0); }}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
            </button>
          </div>
        </div>
        <Outlet />
      </main>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
