import React, { useState } from 'react';
import { CartItem } from '../types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  ShieldCheck,
  Truck
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: 'INR' | 'USD';
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: (discountCents: number, appliedCoupon: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');

  if (!isOpen) return null;

  // Currency Converter Helper
  const formatPrice = (cents: number) => {
    if (currency === 'USD') {
      const usd = cents / 8500;
      return `$${usd.toFixed(2)}`;
    }
    const inr = Math.round(cents / 100);
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  // Subtotal in cents
  const subtotalCents = items.reduce((sum, item) => {
    const price = item.product?.price_cents || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Discount computation based on coupon
  let discountCents = 0;
  if (appliedCoupon === 'GAMER10') {
    discountCents = Math.round(subtotalCents * 0.10);
  } else if (appliedCoupon === 'ABIPRO') {
    discountCents = Math.min(subtotalCents, 50000); // ₹500 in cents
  }

  const freeShippingThreshold = 199900; // ₹1,999
  const isFreeShipping = subtotalCents >= freeShippingThreshold || appliedCoupon === 'FREESHIP';
  const shippingFeeCents = isFreeShipping || items.length === 0 ? 0 : 19900; // ₹199

  const finalTotalCents = Math.max(0, subtotalCents - discountCents + shippingFeeCents);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'GAMER10') {
      setAppliedCoupon('GAMER10');
      setCouponError('');
    } else if (code === 'ABIPRO') {
      if (subtotalCents < 499900) {
        setCouponError('ABIPRO requires minimum cart value of ₹4,999.');
        return;
      }
      setAppliedCoupon('ABIPRO');
      setCouponError('');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon('FREESHIP');
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try GAMER10 or ABIPRO.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Gaming Gear Cart</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300">
                {items.reduce((acc, it) => acc + it.quantity, 0)} items
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Your gaming cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Equip your setup with rapid-trigger keyboards, precision mice, and OLED monitors!
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Browse Hardware Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id || item.product_id}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center space-x-3 group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                      <img
                        src={item.product?.image_url || 'https://images.unsplash.com/photo-1595225476474-87563907a212'}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase">
                        {item.product?.brand || 'Gamer Pro'}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.product?.name || 'Gaming Gear'}
                      </h4>
                      <p className="text-xs font-mono font-bold text-white mt-0.5">
                        {formatPrice(item.product?.price_cents || 0)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1.5">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => onRemoveItem(item.product_id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={onClearCart}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium"
                  >
                    Clear All Cart Items
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-4">
              {/* Promo code input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon: GAMER10 / ABIPRO"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Coupon '{appliedCoupon}' applied successfully!
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-400 font-medium">{couponError}</p>
                )}
              </form>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-200">{formatPrice(subtotalCents)}</span>
                </div>

                {discountCents > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedCoupon}):</span>
                    <span className="font-mono font-bold">-{formatPrice(discountCents)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center">
                    <Truck className="w-3 h-3 mr-1 text-slate-400" />
                    Esports Delivery:
                  </span>
                  <span className="font-mono text-slate-200">
                    {isFreeShipping ? (
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">FREE</span>
                    ) : (
                      formatPrice(shippingFeeCents)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800/80 pt-2">
                  <span>Total Due:</span>
                  <span className="font-mono text-base text-emerald-400">
                    {formatPrice(finalTotalCents)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  onProceedToCheckout(discountCents, appliedCoupon);
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Proceed to Gamer Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by 256-bit SQLite Transaction Isolation</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
