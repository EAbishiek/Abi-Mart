import React, { useState } from 'react';
import { CartItem, Order, ShippingAddress, UserResponseDto } from '../types';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  ArrowRight,
  Package,
  Receipt,
  Download
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  user: UserResponseDto | null;
  currency: 'INR' | 'USD';
  discountCents: number;
  appliedCoupon: string;
  onOrderSuccess: (order: Order) => void;
  onRequireAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  user,
  currency,
  discountCents,
  appliedCoupon,
  onOrderSuccess,
  onRequireAuth,
}) => {
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user ? user.name : 'Alex Mercer',
    phone: '9876543210',
    street: '42 Esports Cyber Arena, Gamer Row',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
  });

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'COD'>('CARD');
  const [deliverySpeed, setDeliverySpeed] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  
  // Card mock state
  const [cardNumber, setCardNumber] = useState<string>('4532 8920 1192 8492');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('842');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

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

  const subtotalCents = cartItems.reduce((sum, it) => {
    const price = it.product?.price_cents || 0;
    return sum + (price * it.quantity);
  }, 0);

  const deliveryFeeCents = deliverySpeed === 'EXPRESS' ? 19900 : (subtotalCents >= 199900 ? 0 : 9900);
  const totalAmountCents = Math.max(0, subtotalCents - discountCents + deliveryFeeCents);

  const autoFillDemoAddress = () => {
    setAddress({
      fullName: user ? user.name : 'Rajarajan D (Pro Gamer)',
      phone: '9043716920',
      street: 'Block 4, Cyber Towers, Tech Corridor',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600096',
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!address.fullName || !address.street || !address.city || !address.pincode) {
      setOrderError('Please complete all address fields.');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    try {
      const res = await fetch('/api/v1/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod,
          discountCents,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.order) {
        setConfirmedOrder(json.data.order);
        onOrderSuccess(json.data.order);
      } else {
        setOrderError(json.error?.message || 'Checkout failed. Please retry.');
      }
    } catch (err: any) {
      setOrderError('Network error while processing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedOrder ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
                Order Confirmed & Authorized
              </span>
              <h2 className="text-2xl font-black text-white">Thank you for your order!</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your high-performance gaming gear is being prepared for express dispatch.
              </p>
            </div>

            {/* Order Receipt Box */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Order ID:</span>
                <span className="text-white font-bold">#{confirmedOrder.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tracking Code:</span>
                <span className="text-indigo-400 font-bold">{confirmedOrder.tracking_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Payment:</span>
                <span className="text-slate-200">{confirmedOrder.payment_method} (Authorized)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Paid:</span>
                <span className="text-emerald-400 font-bold">{formatPrice(confirmedOrder.total_amount_cents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="text-slate-200 truncate max-w-[280px]">
                  {confirmedOrder.shippingAddress?.city}, {confirmedOrder.shippingAddress?.state} - {confirmedOrder.shippingAddress?.pincode}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
              >
                Continue Exploring Gear
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder} className="p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>256-BIT ENCRYPTED CHECKOUT</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Express Gamer Checkout</h2>
              <p className="text-xs text-slate-400">Complete delivery destination and authorize transaction.</p>
            </div>

            {!user && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-amber-300">Sign in to complete order</span>
                  <p className="text-[11px] text-amber-200/70">Orders are securely linked to your registered profile.</p>
                </div>
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Address Form */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>1. Delivery Destination</span>
                </h4>
                <button
                  type="button"
                  onClick={autoFillDemoAddress}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold"
                >
                  ⚡ Auto-Fill Demo Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Gamer Full Name</label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">State & Pincode</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="State"
                    />
                    <input
                      type="text"
                      required
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Speed Options */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Shipping Speed
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  deliverySpeed === 'STANDARD' ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliverySpeed === 'STANDARD'}
                      onChange={() => setDeliverySpeed('STANDARD')}
                      className="text-indigo-600"
                    />
                    <div>
                      <span className="font-bold block text-white">Standard Delivery</span>
                      <span className="text-[10px] text-slate-400">3-4 business days</span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">FREE</span>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  deliverySpeed === 'EXPRESS' ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliverySpeed === 'EXPRESS'}
                      onChange={() => setDeliverySpeed('EXPRESS')}
                      className="text-indigo-600"
                    />
                    <div>
                      <span className="font-bold block text-white">Esports 24h Rush</span>
                      <span className="text-[10px] text-slate-400">Guaranteed next-day</span>
                    </div>
                  </div>
                  <span className="font-mono text-indigo-300 font-bold text-[11px]">₹199</span>
                </label>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>3. Payment Method</span>
              </h4>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                    paymentMethod === 'CARD' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                    paymentMethod === 'UPI' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                    paymentMethod === 'COD' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Pay on Delivery</span>
                </button>
              </div>

              {/* Payment Detail Details */}
              {paymentMethod === 'CARD' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white p-1.5 rounded-lg shrink-0 flex items-center justify-center">
                    <div className="w-full h-full border-4 border-slate-950 flex items-center justify-center font-mono font-bold text-[9px] text-slate-950 text-center leading-tight">
                      ABIMART UPI QR
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-white block">Scan with any UPI App</span>
                    <p className="text-[11px] text-slate-400">GPay, PhonePe, Paytm, or BHIM</p>
                    <span className="font-mono text-indigo-400 text-[11px] block">UPI ID: abimart@gamingpay</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <p>Pay cash or scan QR upon physical package handover by the express courier.</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {orderError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30 font-medium">
                {orderError}
              </p>
            )}

            {/* Checkout Pricing Footer */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">TOTAL PAYABLE</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {formatPrice(totalAmountCents)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 disabled:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2 hover:scale-105 active:scale-95"
              >
                <span>{isSubmitting ? 'Processing Transaction...' : 'Authorize & Place Order'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
