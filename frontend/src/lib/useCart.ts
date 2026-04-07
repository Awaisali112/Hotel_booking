import { useState, useCallback } from 'react';
import { MenuItem } from '../data/menu';

export interface CartItem extends MenuItem {
  qty: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: MenuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((name: string) => {
    setItems(prev => prev.filter(i => i.name !== name));
  }, []);

  const updateQty = useCallback((name: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.name !== name));
    } else {
      setItems(prev => prev.map(i => i.name === name ? { ...i, qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => {
    const price = parseFloat(i.price.replace('$', ''));
    return sum + price * i.qty;
  }, 0);

  return { items, addToCart, removeFromCart, updateQty, clearCart, total };
}
