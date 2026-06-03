import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Eye, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useApp();

  const formattedPrice = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-2">
      {/* Absolute Badges */}
      <span className="absolute top-3.5 left-3.5 z-10 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase shadow-sm">
        -20% OFF
      </span>
      
      {product.stock === 0 ? (
        <span className="absolute top-3.5 right-3.5 z-10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white bg-slate-800 rounded-full shadow-sm">
          Sold Out
        </span>
      ) : product.stock <= 5 ? (
        <span className="absolute top-3.5 right-3.5 z-10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white bg-orange-600 rounded-full shadow-sm">
          Few Left
        </span>
      ) : product.featured ? (
        <span className="absolute top-3.5 right-3.5 z-10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white bg-amber-500 rounded-full shadow-sm">
          Best Seller
        </span>
      ) : null}

      {/* Graphic Product Cover Thumbnail Container */}
      <div 
        onClick={() => onViewDetails(product)}
        className="h-44 sm:h-48 bg-slate-50 dark:bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden mb-3 relative cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {/* Quick View Cover Overlay */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="p-3 bg-white hover:bg-slate-100 text-slate-800 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Details Box */}
      <div className="p-1 pb-1 flex flex-col justify-between min-h-[148px]">
        <div>
          {/* Category */}
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mb-1 px-0.5">
            {product.category}
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-xs font-bold text-slate-750 dark:text-slate-200 line-clamp-2 hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer min-h-[32px] leading-snug px-0.5"
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Buy Action Row */}
        <div className="mt-2.5 flex items-end justify-between px-0.5">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-450 dark:text-slate-500 line-through leading-none mb-0.5">
              {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(product.price * 1.25)}
            </span>
            <span className="text-sm font-black text-orange-600 dark:text-orange-550 leading-none">
              {formattedPrice}
            </span>
          </div>

          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => addToCart(product)}
            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:dark:text-slate-600 disabled:cursor-not-allowed text-white text-[11px] font-black rounded-lg transition-all active:scale-95 duration-200 cursor-pointer"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
};
