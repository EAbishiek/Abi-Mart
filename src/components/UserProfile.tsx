import React from 'react';
import { UserResponseDto } from '../types';
import { User, ShieldCheck, Key, Clock, Mail, LogOut, CheckCircle2, Store, ShoppingBag, Lock } from 'lucide-react';

interface UserProfileProps {
  user: UserResponseDto;
  token: string;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, token, onLogout }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl w-full mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/40 border-2 border-indigo-400/40 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-xs text-slate-300 font-mono">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                user.role === 'ADMIN'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : user.role === 'SELLER'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              Role: {user.role}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Registered ID #{user.id}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Auth Session Status Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-emerald-950">Active Session Authenticated</p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Drogon/Express cookie session issued (`auth_token`). User role privileges actively enforced by `AuthFilter` middleware.
            </p>
          </div>
        </div>

        {/* User Role Capabilities Card */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Account Role Capabilities (Capstone Feature Map)
          </h3>

          {user.role === 'ADMIN' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-950 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-amber-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Capabilities (Feature F7 & Migration Seeded)</span>
              </div>
              <ul className="text-xs space-y-1 text-amber-800 list-disc list-inside pl-1">
                <td>View all registered users and order histories across marketplace</td>
                <td>Moderate and remove illegal or flagged product listings</td>
                <td>Execute database migrations & system maintenance queries</td>
              </ul>
            </div>
          )}

          {user.role === 'SELLER' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-purple-950 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-purple-900 text-sm">
                <Store className="w-4 h-4 text-purple-600" />
                <span>Seller Capabilities (Feature F2 & F6)</span>
              </div>
              <ul className="text-xs space-y-1 text-purple-800 list-disc list-inside pl-1">
                <td>Create, edit, and delete product listings (price, stock, category)</td>
                <td>View incoming customer orders for listed inventory items</td>
                <td>Manage seller sales metrics dashboard</td>
              </ul>
            </div>
          )}

          {user.role === 'BUYER' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-emerald-900 text-sm">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Buyer Capabilities (Feature F3, F4, F5)</span>
              </div>
              <ul className="text-xs space-y-1 text-emerald-800 list-disc list-inside pl-1">
                <td>Browse and search products by category & keyword</td>
                <td>Add/update cart items and view running totals</td>
                <td>Place orders with mock payment confirmation & view purchase history</td>
              </ul>
            </div>
          )}
        </div>

        {/* Security Token Details */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
            <span>Session Token (JWT Payload)</span>
            <span className="text-[10px] text-indigo-600 font-mono">HttpOnly Cookie</span>
          </h3>
          <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-x-auto max-h-24 break-all border border-slate-800">
            {token}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onLogout}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all flex items-center space-x-2 shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Auth Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
