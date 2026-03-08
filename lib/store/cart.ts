import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Reusing the structure from the customizer or defining a compatible one
export interface SerializedOption {
  id: string;
  name: string;
  price: number;
  linkedProduct?: { imageUrl: string | null } | null;
}

export interface SerializedModifier {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: SerializedOption[];
}

export interface SerializedProduct {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  type?: string;
  modifiers: SerializedModifier[];
}

export interface CartItem {
  id: string;
  product: SerializedProduct;
  quantity: number;
  selections: Record<string, string[]>;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        const { product, selections, quantity, unitPrice, notes } = newItem;
        const selectionKey = JSON.stringify(selections);
        const uniqueId = `${product.id}-${selectionKey}-${notes ?? ""}`;

        set((state) => {
            const existingItemIndex = state.items.findIndex(i => i.id === uniqueId);
            
            if (existingItemIndex > -1) {
                // Update existing
                const updatedItems = [...state.items];
                const existingItem = updatedItems[existingItemIndex];
                updatedItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + quantity,
                    totalPrice: (existingItem.quantity + quantity) * unitPrice
                };
                return { items: updatedItems };
            } else {
                // Add new
                return {
                    items: [...state.items, {
                        ...newItem,
                        id: uniqueId,
                        totalPrice: quantity * unitPrice
                    }]
                };
            }
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, delta) => {
        set((state) => {
          const items = state.items.map((item) => {
            if (item.id === id) {
              const newQuantity = Math.max(1, item.quantity + delta);
              return {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * item.unitPrice,
              };
            }
            return item;
          });
          return { items };
        });
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },

      getItemCount: () => {
          return get().items.reduce((acc, item) => acc + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
