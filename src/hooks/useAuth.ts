/**
 * useAuth hook — convenience wrapper around authStore for components
 */
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isAuthenticated, isLoading, loadUser, logout, login, register } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    loadUser,
    logout,
    login,
    register,
  };
}
