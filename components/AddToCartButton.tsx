"use client";

import { useCartStore } from '../lib/store';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: any }) {
  const { items, addToCart } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);

  // 获取当前购物车中该产品的数量
  const currentItem = items.find((item) => item.id === product._id);
  const currentQty = currentItem ? currentItem.quantity : 0;
  
  // 获取最大库存
  const MAX_STOCK = product.stock !== undefined ? product.stock : 999;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    // 首页库存检查
    if (currentQty + 1 > MAX_STOCK) {
      alert(`Sorry, we only have ${MAX_STOCK} of this item in stock.`);
      return;
    }

    addToCart({
      id: product._id, 
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      stock: MAX_STOCK, // 传入库存
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  return (
    <button 
      onClick={handleAdd}
      disabled={product.stock <= 0}
      className={`w-full py-2 rounded-lg font-bold transition-all duration-200 text-sm uppercase tracking-wide ${
        isAdded 
          ? "bg-green-600 text-white scale-95" 
          : product.stock <= 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800 active:scale-95"
      }`}
    >
      {product.stock <= 0 ? "Sold Out" : (isAdded ? "Added ✔" : "Add to Cart")}
    </button>
  );
}