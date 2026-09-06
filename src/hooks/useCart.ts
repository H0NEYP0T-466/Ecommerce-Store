/**
 * useCart hook — convenience wrapper around cartStore for components
 */
import { useCartStore } from '../store/cartStore';

export function useCart() {
  const { cart, isLoading, loadCart, addToCart, updateQuantity, removeItem, clearCart } = useCartStore();

  const items = cart?.items || [];
  const total = cart?.total || 0;
  const itemCount = cart?.item_count || 0;
  const isEmpty = itemCount === 0;

  return {
    cart,
    items,
    total,
    itemCount,
    isEmpty,
    isLoading,
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
