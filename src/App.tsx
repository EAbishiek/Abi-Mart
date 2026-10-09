import React, { useEffect, useState } from 'react';
import { UserResponseDto, Product, CartItem, Order } from './types';
import { Header } from './components/Header';
import { Storefront } from './components/Storefront';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrdersPortal } from './components/OrdersPortal';
import { SellerPortal } from './components/SellerPortal';
import { CapstonePresentation } from './components/CapstonePresentation';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { UserProfile } from './components/UserProfile';
import { DatabaseInspector } from './components/DatabaseInspector';
import { ApiContractViewer } from './components/ApiContractViewer';
import { RequirementsChecklist } from './components/RequirementsChecklist';
import { Sparkles, Gamepad2, ShieldCheck, Database, ShoppingBag, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [token, setToken] = useState<string>('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<string>('store');
  const [serverHealth, setServerHealth] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');
  const [initializing, setInitializing] = useState<boolean>(true);

  // E-Commerce Global State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [appliedDiscountCents, setAppliedDiscountCents] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Fetch Products Catalog
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/v1/products');
      const json = await res.json();
      if (json.success && json.data) {
        setProducts(json.data.products || []);
        setCategories(json.data.categories || []);
        setBrands(json.data.brands || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  // Fetch Cart Items from Database
  const fetchCart = async () => {
    try {
      const res = await fetch('/api/v1/cart');
      const json = await res.json();
      if (json.success && json.data?.items) {
        setCartItems(json.data.items);
      }
    } catch {
      // Guest local fallback
    }
  };

  // Initial Server Check & Session Validation
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Health check
        const healthRes = await fetch('/api/v1/health');
        const healthJson = await healthRes.json();
        if (healthJson.success && healthJson.data?.status === 'UP') {
          setServerHealth('UP');
        } else {
          setServerHealth('DOWN');
        }

        // 2. Auth Session check
        const meRes = await fetch('/api/v1/auth/me');
        const meJson = await meRes.json();
        if (meJson.success && meJson.data?.user) {
          setUser(meJson.data.user);
          setToken(meJson.data.token || '');
          fetchCart();
        }

        // 3. Load catalog
        await fetchProducts();
      } catch {
        setServerHealth('DOWN');
      } finally {
        setInitializing(false);
      }
    };

    init();
  }, []);

  // Cart Operations
  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (user) {
      try {
        const res = await fetch('/api/v1/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity }),
        });
        const json = await res.json();
        if (json.success && json.data?.items) {
          setCartItems(json.data.items);
          showToast(`Added ${product.name} to cart!`);
          return;
        }
      } catch (err) {
        console.error('Cart add error:', err);
      }
    }

    // Guest Cart Fallback
    setCartItems((prev) => {
      const idx = prev.findIndex((it) => it.product_id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += quantity;
        return copy;
      }
      return [...prev, { id: Date.now(), user_id: 0, product_id: product.id, quantity, product }];
    });
    showToast(`Added ${product.name} to cart!`);
  };

  const handleUpdateCartQuantity = async (productId: number, quantity: number) => {
    if (user) {
      try {
        const res = await fetch(`/api/v1/cart/items/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        });
        const json = await res.json();
        if (json.success && json.data?.items) {
          setCartItems(json.data.items);
          return;
        }
      } catch (err) {
        console.error('Cart update error:', err);
      }
    }

    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((it) => it.product_id !== productId);
      }
      return prev.map((it) => (it.product_id === productId ? { ...it, quantity } : it));
    });
  };

  const handleRemoveCartItem = async (productId: number) => {
    if (user) {
      try {
        const res = await fetch(`/api/v1/cart/items/${productId}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success && json.data?.items) {
          setCartItems(json.data.items);
          return;
        }
      } catch (err) {
        console.error('Cart remove error:', err);
      }
    }

    setCartItems((prev) => prev.filter((it) => it.product_id !== productId));
  };

  const handleClearCart = async () => {
    if (user) {
      try {
        await fetch('/api/v1/cart/clear', { method: 'POST' });
      } catch (err) {
        console.error('Cart clear error:', err);
      }
    }
    setCartItems([]);
  };

  const handleProceedToCheckout = (discountCents: number, coupon: string) => {
    setAppliedDiscountCents(discountCents);
    setAppliedCoupon(coupon);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCartItems([]);
    fetchProducts();
    showToast(`Order #${order.id} placed successfully! Tracking: ${order.tracking_number}`);
  };

  const handleAuthSuccess = async (u: UserResponseDto, tok: string) => {
    setUser(u);
    setToken(tok);
    showToast(`Welcome back, ${u.name}! (${u.role})`);

    // Sync guest cart items to newly logged in user
    if (cartItems.length > 0) {
      try {
        const guestItems = cartItems.map((it) => ({ productId: it.product_id, quantity: it.quantity }));
        const res = await fetch('/api/v1/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestItems }),
        });
        const json = await res.json();
        if (json.success && json.data?.items) {
          setCartItems(json.data.items);
        }
      } catch {
        fetchCart();
      }
    } else {
      fetchCart();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
      setToken('');
      setCartItems([]);
      showToast('Logged out of session.');
    }
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 border border-indigo-400/40 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main High-Performance Navigation Header */}
      <Header
        user={user}
        serverHealth={serverHealth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Slide-over Gaming Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* 3-Step Express Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        user={user}
        currency={currency}
        discountCents={appliedDiscountCents}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={handleOrderSuccess}
        onRequireAuth={() => {
          setIsCheckoutOpen(false);
          setActiveTab('auth');
        }}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {initializing ? (
          <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="text-xs text-slate-400 font-mono font-medium animate-pulse">
              Initializing AbiMart Express Server & SQLite Migration Engine...
            </p>
          </div>
        ) : (
          <div>
            {/* VIEW 1: Esports Catalog Storefront */}
            {activeTab === 'store' && (
              <Storefront
                products={products}
                categories={categories}
                brands={brands}
                user={user}
                currency={currency}
                onAddToCart={handleAddToCart}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefreshProducts={fetchProducts}
              />
            )}

            {/* VIEW 2: Order Tracking & History Portal */}
            {activeTab === 'orders' && (
              <OrdersPortal
                user={user}
                currency={currency}
                onNavigateToStore={() => setActiveTab('store')}
              />
            )}

            {/* VIEW 3: Merchant & Seller Hub */}
            {activeTab === 'seller' && (
              <SellerPortal
                user={user}
                products={products}
                currency={currency}
                onRefreshProducts={fetchProducts}
                onRequireAuth={() => setActiveTab('auth')}
              />
            )}

            {/* VIEW 4: Capstone Review Deck & Automated Verification Suite */}
            {activeTab === 'presentation' && (
              <CapstonePresentation
                onTriggerCatalogTest={() => setActiveTab('store')}
              />
            )}

            {/* VIEW 5: Authentication Portal */}
            {activeTab === 'auth' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                {!user && (
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>Capstone Deliverable F1</span>
                      </div>
                      <h1 className="text-xl font-bold tracking-tight">
                        Gamer Identity & Authentication Portal
                      </h1>
                      <p className="text-xs text-slate-300">
                        Role-based access control (Buyer/Seller public registration, Admin seeded via migrations, salted bcrypt hashing).
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setAuthMode('login')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          authMode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sign In Form
                      </button>
                      <button
                        onClick={() => setAuthMode('register')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          authMode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Registration Form
                      </button>
                    </div>
                  </div>
                )}

                {user ? (
                  <UserProfile user={user} token={token} onLogout={handleLogout} />
                ) : authMode === 'login' ? (
                  <LoginForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToRegister={() => setAuthMode('register')}
                  />
                ) : (
                  <RegisterForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToLogin={() => setAuthMode('login')}
                  />
                )}
              </div>
            )}

            {/* VIEW 6: SQLite Database Inspector */}
            {activeTab === 'database' && <DatabaseInspector />}

            {/* VIEW 7: API Contract Test Bench */}
            {activeTab === 'api' && <ApiContractViewer />}

            {/* VIEW 8: Week 1 & 2 Capstone Audit Checklist */}
            {activeTab === 'checklist' && <RequirementsChecklist />}
          </div>
        )}
      </main>

      {/* High-Tech Gaming Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              <span className="font-extrabold text-white text-sm">ABIMART GAMING E-COMMERCE</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Capstone Project • Student: ABISHIEK E (IT-A, 9043716920) • Reviewer: Dr. SAROJADEVI
            </p>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
            <span>React 19</span>
            <span>•</span>
            <span>Express v4</span>
            <span>•</span>
            <span>SQLite Embedded DB</span>
            <span>•</span>
            <span>bcrypt Hashing</span>
            <span>•</span>
            <span>/api/v1/ Envelopes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
