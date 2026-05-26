import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number; // 关键修复：增加库存字段定义
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product) => set((state) => {
        const existingItem = state.items.find(item => item.id === (product.id || product._id));
        
        // 确保传入的库存有效，默认为 0
        const stock = product.stock !== undefined ? product.stock : 0;

        if (existingItem) {
          // 如果已存在，增加数量（这里不检查库存，因为加购按钮组件已经检查过了）
          return {
            items: state.items.map(item => 
              item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          };
        }
        
        // 新增商品：关键修复，必须把 stock 存进去
        return { items: [...state.items, { 
            id: product.id || product._id, 
            name: product.name, 
            price: product.price, 
            quantity: 1,
            image: product.image,
            stock: stock // 保存库存
        }] };
      }),

      removeFromCart: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item => 
            // 最小值限制为 1
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'shopping-cart-storage',
    }
  )
);