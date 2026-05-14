import { create } from "zustand";
import { CartItem, CartAction, MenuItem } from "../types";

interface CartStore {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyActions: (actions: CartAction[], menuItems: MenuItem[]) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (menuItem, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === menuItem.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === menuItem.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity,
            emoji: menuItem.emoji,
          },
        ],
      };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    }));
  },

  clearCart: () => set({ items: [] }),

  applyActions: (actions, menuItems) => {
    for (const action of actions) {
      if (action.type === "CLEAR_CART") {
        get().clearCart();
        continue;
      }

      const menuItem = menuItems.find(
        (m) => m.id === action.itemId || m.name.toLowerCase() === action.itemName?.toLowerCase()
      );

      if (!menuItem) continue;

      switch (action.type) {
        case "ADD_ITEM":
          get().addItem(menuItem!, action.quantity ?? 1);
          break;
        case "REMOVE_ITEM":
          get().removeItem(menuItem!.id);
          break;
        case "UPDATE_QUANTITY":
          get().updateQuantity(menuItem!.id, action.quantity ?? 1);
          break;
      }
    }
  },

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
