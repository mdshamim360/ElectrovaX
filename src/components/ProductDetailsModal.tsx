import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, ShoppingBag, Radio, HelpCircle } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  const { addToCart } = useApp();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const handleIncrement = () => {
    if (qty < product.stock) {
      setQty(qty + 1);
    }
  };

  const handleDecrement = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  const handleAdd = () => {
    addToCart(product, qty);
    onClose();
  };

  const formattedPrice = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0
  }).format(product.price * qty);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* Close Button absolute */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* Product Image Cover Banner */}
        <div className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 md:p-12 relative">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-h-80 md:max-h-[440px] w-full object-contain rounded-xl"
          />
        </div>

        {/* Content Details Box */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Tag Category */}
            <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 rounded-lg mb-3">
              {product.category}
            </span>

            {/* Product Title */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-850 dark:text-white leading-snug">
              {product.name}
            </h2>

            {/* Price Line */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-black text-orange-600 dark:text-orange-500">
                {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(product.price)}
              </span>
              <span className="text-sm font-medium line-through text-slate-400">
                {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(product.price * 1.3)}
              </span>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                -30% OFF
              </span>
            </div>

            {/* Stock Status Logics */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {product.stock > 0 ? `In Stock (Only ${product.stock} items remaining)` : 'Out of Stock'}
              </span>
            </div>

            {/* Description Paragraph */}
            <div className="mt-6">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Product Details
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                {product.description}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            {product.stock > 0 ? (
              <div className="flex flex-col gap-4">
                {/* Quantity Control Selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Select Quantity</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Adjust quantity to update summary total.</p>
                  </div>
                  
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <button
                      onClick={handleDecrement}
                      disabled={qty <= 1}
                      className="p-2 px-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 select-none transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 text-xs font-extrabold text-slate-800 dark:text-slate-200 min-w-[24px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={qty >= product.stock}
                      className="p-2 px-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 select-none transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Confirm Multi-add action button */}
                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Total Value</span>
                    <span className="text-xl font-bold text-slate-800 dark:text-white mt-1 leading-none">{formattedPrice}</span>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-orange-500/20 active:scale-98 transition-all"
                  >
                    <ShoppingBag size={16} />
                    Add to Cart Summary
                  </button>
                </div>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 text-sm font-semibold rounded-xl cursor-not-allowed text-center"
              >
                Permanently Out of Stock
              </button>
            )}
            
            {/* Bangladeshi Logistics assurance trust signals */}
            <div className="mt-4 flex items-center justify-around text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">🛡️ 100% Genuine</span>
              <span className="flex items-center gap-1">🔄 7 Days Easy Returns</span>
              <span className="flex items-center gap-1">🚚 Home Delivery (Dhaka)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
