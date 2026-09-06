/**
 * useAuth hook — convenience wrapper around authStore for components
 */
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isAuthenticated, loading, loadUser, logout } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    loadUser,
    logout,
  };
}
