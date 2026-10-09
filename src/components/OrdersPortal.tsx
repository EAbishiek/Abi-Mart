import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, UserResponseDto } from '../types';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  RefreshCw, 
  ChevronRight, 
  AlertCircle,
  MapPin,
  CreditCard,
  Printer,
  X
} from 'lucide-react';

interface OrdersPortalProps {
  user: UserResponseDto | null;
  currency: 'INR' | 'USD';
  onNavigateToStore: () => void;
}

export const OrdersPortal: React.FC<OrdersPortalProps> = ({
  user,
  currency,
  onNavigateToStore,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/orders');
      const json = await res.json();
      if (json.success && json.data?.orders) {
        setOrders(json.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Currency Converter Helper
  const formatPrice = (cents: number) => {
    if (currency === 'USD') {
      const usd = cents / 8500;
      return `$${usd.toFixed(2)}`;
    }
    const inr = Math.round(cents / 100);
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  // Status Stepper stages
  const STAGES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  const getStageIndex = (status: OrderStatus) => {
    return STAGES.indexOf(status);
  };

  // Helper to advance status for demo testing
  const handleAdvanceStatus = async (order: Order) => {
    const currentIdx = getStageIndex(order.status);
    if (currentIdx >= STAGES.length - 1) return;

    const nextStatus = STAGES[currentIdx + 1];
    setUpdatingOrderId(order.id);

    try {
      const res = await fetch(`/api/v1/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success && json.data?.order) {
        setOrders(orders.map((o) => (o.id === order.id ? json.data.order : o)));
      }
    } catch (err) {
      console.error('Failed to advance order status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 max-w-xl mx-auto p-6">
        <Package className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign in to view your orders</h2>
        <p className="text-xs text-slate-400">
          Track shipments, view itemized gaming equipment invoices, and manage past purchases.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Order Tracking & History</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status updates, logistics tracking numbers, and official VAT/GST invoices.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tracking</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">
          Loading order history from SQLite database...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <Truck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No orders placed yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our catalog to equip your setup with the highest-tier esports peripherals!
          </p>
          <button
            onClick={onNavigateToStore}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Explore Hardware Store
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const currentStage = getStageIndex(order.status);

            return (
              <div
                key={order.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold bg-indigo-600/20 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/30">
                        ORDER #{order.id}
                      </span>
                      <span className="text-xs text-slate-400">
                        Placed on {new Date(order.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-slate-400">Tracking Code:</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {order.tracking_number}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">TOTAL AMOUNT</span>
                      <span className="text-base font-black text-white font-mono">
                        {formatPrice(order.total_amount_cents)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors"
                      title="View Official Invoice"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tracking Stepper */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-indigo-400" />
                      <span>Fulfillment Status: <strong className="text-white uppercase font-mono">{order.status}</strong></span>
                    </span>

                    {/* Faculty Demo Helper: Advance status */}
                    {(user.role === 'SELLER' || user.role === 'ADMIN' || order.status !== 'DELIVERED') && (
                      <button
                        disabled={updatingOrderId === order.id || order.status === 'DELIVERED'}
                        onClick={() => handleAdvanceStatus(order)}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-all flex items-center space-x-1 disabled:opacity-50"
                        title="Simulate advance to next logistical phase"
                      >
                        <span>{updatingOrderId === order.id ? 'Advancing...' : order.status === 'DELIVERED' ? 'Delivered' : '⚡ Simulate Next Phase'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Visual Step Progress Bar */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {STAGES.map((stage, idx) => {
                      const isComplete = idx <= currentStage;
                      const isCurrent = idx === currentStage;

                      return (
                        <div key={stage} className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isComplete
                                ? 'bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-sm shadow-emerald-400/30'
                                : 'bg-slate-800'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold block truncate ${
                              isCurrent
                                ? 'text-emerald-400'
                                : isComplete
                                ? 'text-slate-300'
                                : 'text-slate-600'
                            }`}
                          >
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Purchased Gear ({order.items?.length || 0})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-3"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                          <img
                            src={item.product?.image_url || 'https://images.unsplash.com/photo-1595225476474-87563907a212'}
                            alt={item.product?.name || 'Item'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">
                            {item.product?.name || 'Hardware Peripheral'}
                          </h5>
                          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-0.5">
                            <span>Qty: <strong className="text-slate-200">{item.quantity}</strong></span>
                            <span className="font-mono text-slate-200">{formatPrice(item.unit_price_cents * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment Footer Info */}
                {order.shippingAddress && (
                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-4 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state}
                    </span>
                    <span className="flex items-center">
                      <CreditCard className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Payment: {order.payment_method}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedInvoiceOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-wider uppercase">
                AbiMart Capstone Tax Invoice
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Invoice #{selectedInvoiceOrder.id}</h3>
              <p className="text-xs text-slate-400">Tracking: {selectedInvoiceOrder.tracking_number}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">BILLED TO:</span>
                  <span className="text-white font-bold">{selectedInvoiceOrder.shippingAddress?.fullName}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {selectedInvoiceOrder.shippingAddress?.street}, {selectedInvoiceOrder.shippingAddress?.city}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PAYMENT METHOD:</span>
                  <span className="text-white font-bold">{selectedInvoiceOrder.payment_method}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Authorized & Captured</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Itemized Manifest</span>
                {selectedInvoiceOrder.items?.map((it) => (
                  <div key={it.id} className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-300">
                      {it.product?.name} x {it.quantity}
                    </span>
                    <span className="font-mono text-white">
                      {formatPrice(it.unit_price_cents * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-base font-black text-white border-t border-slate-800 pt-3">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-400 font-mono">
                  {formatPrice(selectedInvoiceOrder.total_amount_cents)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
