import React, { useState } from 'react';
import { UserResponseDto, UserRole } from '../types';
import { UserPlus, Mail, Key, User as UserIcon, ShoppingBag, Store, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface RegisterFormProps {
  onSuccess: (user: UserResponseDto, token: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    // Client-side quick check
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword, role }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || 'Registration failed.');
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-md w-full mx-auto">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white text-center relative">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 mb-3 text-indigo-300">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
        <p className="text-slate-300 text-xs mt-1">
          Register as a Buyer or Seller on AbiMart
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-5">
        {/* Admin Role Constraint Note */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong className="font-semibold">Capstone Rule (F1):</strong> Public registration is restricted to <strong>Buyer</strong> or <strong>Seller</strong> roles. Admin role is seeded by database migration.
          </p>
        </div>

        {/* Global Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-sm flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Registration Failed</p>
              <p className="text-xs text-red-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                  role === 'BUYER'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 ${role === 'BUYER' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-sm">Buyer</div>
                  <div className="text-[11px] text-slate-500">Browse & Order</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                  role === 'SELLER'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-600/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Store className={`w-5 h-5 ${role === 'SELLER' ? 'text-purple-600' : 'text-slate-400'}`} />
                <div>
                  <div className="font-bold text-sm">Seller</div>
                  <div className="text-[11px] text-slate-500">List Products</div>
                </div>
              </button>
            </div>
            {fieldErrors.role && <p className="text-xs text-red-600 mt-1">{fieldErrors.role}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.name
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-indigo-600'
                }`}
              />
            </div>
            {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-indigo-600'
                }`}
              />
            </div>
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-indigo-600'
                  }`}
                />
              </div>
              {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat pass"
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-indigo-600'
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <span>Registering Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-indigo-600 hover:text-indigo-800 underline ml-1 cursor-pointer"
            >
              Log In Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
