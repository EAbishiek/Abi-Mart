import React from 'react';
import { UserResponseDto } from '../types';
import { 
  Gamepad2, 
  ShoppingCart, 
  Package, 
  Store, 
  ShieldCheck, 
  Database, 
  Cpu, 
  LogOut, 
  User as UserIcon, 
  Search, 
  Presentation,
  Flame,
  LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  user: UserResponseDto | null;
  serverHealth: 'UP' | 'DOWN' | 'CHECKING';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  serverHealth,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  onLogout,
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
}) => {
  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-50 transition-all">
      {/* Top Cyberpunk Banner Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-900/40 text-[11px] py-1 px-4 text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-emerald-400 font-semibold">
              <Flame className="w-3.5 h-3.5 mr-1 text-emerald-400 animate-pulse" />
              CAPSTONE PROJECT: ABIMART GAMING E-COMMERCE
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-400 font-mono">
              Student: ABISHIEK E (IT-A) • Reviewer: Dr. SAROJADEVI
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 font-mono text-[10px]">
              <span className={`w-2 h-2 rounded-full ${
                serverHealth === 'UP' ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-red-400'
              }`} />
              <span className="text-slate-300">BACKEND: {serverHealth}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">SQLITE: EMBEDDED</span>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5">
              <button
                onClick={() => setCurrency('INR')}
                className={`text-[10px] font-bold px-1 rounded transition-colors ${
                  currency === 'INR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`text-[10px] font-bold px-1 rounded transition-colors ${
                  currency === 'USD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('store')}
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
          >
            <div className="relative bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-emerald-300 bg-clip-text text-transparent">
                  ABIMART
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  GAMING PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Esports Hardware & Capstone Architecture</p>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'store') setActiveTab('store');
                }}
                placeholder="Search keyboards, mice, headsets..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'store'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('seller')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'seller'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
              <span>Seller Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('presentation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'presentation'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Capstone Deck</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all ${
                activeTab === 'database'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>DB Inspector</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all ${
                activeTab === 'api'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>API</span>
            </button>
          </nav>

          {/* Action Buttons: Cart + Auth Profile */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Cart Trigger */}
            <button
              id="cart-drawer-trigger"
              onClick={onOpenCart}
              className="relative p-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl transition-all hover:scale-105"
              title="Open Gaming Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Profile / Login Prompt */}
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5 pl-3">
                <div 
                  onClick={() => setActiveTab('auth')}
                  className="flex flex-col text-right cursor-pointer"
                >
                  <span className="text-xs font-bold text-white truncate max-w-[110px]">
                    {user.name}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded w-fit self-end ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : user.role === 'SELLER'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout Session"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-900/95 overflow-x-auto px-3 py-2 space-x-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'store' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800'
          }`}
        >
          Catalog
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('seller')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'seller' ? 'bg-purple-600 text-white' : 'text-slate-300 bg-slate-800'
          }`}
        >
          Seller Hub
        </button>
        <button
          onClick={() => setActiveTab('presentation')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'presentation' ? 'bg-emerald-600 text-white' : 'text-slate-300 bg-slate-800'
          }`}
        >
          Capstone Deck
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'database' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800'
          }`}
        >
          DB
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
            activeTab === 'api' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-800'
          }`}
        >
          API
        </button>
      </div>
    </header>
  );
};
