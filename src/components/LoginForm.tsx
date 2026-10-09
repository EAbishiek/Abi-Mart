import React, { useState } from 'react';
import { UserResponseDto } from '../types';
import { LogIn, Key, Mail, AlertCircle, Shield, ShoppingBag, Store, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess: (user: UserResponseDto, token: string) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Authentication failed.');
        if (json.error?.fieldErrors) {
          setFieldErrors(json.error.fieldErrors);
        }
        return;
      }

      onSuccess(json.data.user, json.data.token);
    } catch (err: any) {
      setErrorMsg('Network or server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (accountEmail: string, accountPass: string) => {
    setEmail(accountEmail);
    setPassword(accountPass);
    setErrorMsg(null);
    setFieldErrors({});
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-md w-full mx-auto">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white text-center relative">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 mb-3 text-indigo-300">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Marketplace Login</h2>
        <p className="text-slate-300 text-xs mt-1">
          Authenticate session to access Buyer, Seller, or Admin roles
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Error Alert Box */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-sm flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Login Unsuccessful</p>
              <p className="text-xs text-red-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@abimart.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-indigo-600 focus:border-indigo-600'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.password
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-indigo-600 focus:border-indigo-600'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Test Login Shortcuts */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
            Quick Test Accounts (Seeded Data)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@abimart.com', 'admin123')}
              className="p-2 border border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 rounded-lg text-xs font-medium flex flex-col items-center space-y-1 transition-colors"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('seller@abimart.com', 'seller123')}
              className="p-2 border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-900 rounded-lg text-xs font-medium flex flex-col items-center space-y-1 transition-colors"
            >
              <Store className="w-4 h-4 text-purple-600" />
              <span>Seller</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('buyer@abimart.com', 'buyer123')}
              className="p-2 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 rounded-lg text-xs font-medium flex flex-col items-center space-y-1 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Buyer</span>
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-indigo-600 hover:text-indigo-800 underline ml-1 cursor-pointer"
            >
              Register New Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
