/**
 * useCart hook — convenience wrapper around cartStore for components
 */
import { useCartStore } from '../store/cartStore';

export function useCart() {
  const { items, total, itemCount, loading, loadCart, addItem, updateItem, removeItem, clearCart } = useCartStore();

  const isEmpty = itemCount === 0;

  return {
    items,
    total,
    itemCount,
    isEmpty,
    loading,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };
}
