import React, { useState } from 'react';
import { Product, UserResponseDto } from '../types';
import { 
  Plus, 
  Package, 
  DollarSign, 
  Layers, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  X,
  Cpu
} from 'lucide-react';

interface SellerPortalProps {
  user: UserResponseDto | null;
  products: Product[];
  currency: 'INR' | 'USD';
  onRefreshProducts: () => void;
  onRequireAuth: () => void;
}

export const SellerPortal: React.FC<SellerPortalProps> = ({
  user,
  products,
  currency,
  onRefreshProducts,
  onRequireAuth,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [brand, setBrand] = useState<string>('AbiMart Pro');
  const [category, setCategory] = useState<string>('Keyboards');
  const [priceInr, setPriceInr] = useState<number>(14999);
  const [stockQty, setStockQty] = useState<number>(20);
  const [badge, setBadge] = useState<string>('ESPORTS PRO');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80');
  const [description, setDescription] = useState<string>('Premium esports hardware for competitive gamers.');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);

  // Currency Converter Helper
  const formatPrice = (cents: number) => {
    if (currency === 'USD') {
      const usd = cents / 8500;
      return `$${usd.toFixed(2)}`;
    }
    const inr = Math.round(cents / 100);
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  const sellerProducts = products.filter(
    (p) => user && (user.role === 'ADMIN' || p.seller_id === user.id || user.role === 'SELLER')
  );

  const totalStockUnits = sellerProducts.reduce((sum, p) => sum + p.stock_qty, 0);
  const totalCatalogValueCents = sellerProducts.reduce((sum, p) => sum + (p.price_cents * p.stock_qty), 0);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    setSubmitting(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim(),
          category,
          price_cents: priceInr * 100,
          stock_qty: stockQty,
          badge: badge.trim(),
          image_url: imageUrl.trim(),
          description: description.trim(),
          specs_json: JSON.stringify({
            "Polling Rate": "1000 Hz",
            "Build": "Esports Tournament Grade",
            "Warranty": "2 Years Official"
          })
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.product) {
        setStatusMessage('Product successfully created in SQLite database!');
        setIsAddModalOpen(false);
        // Reset form
        setName('');
        onRefreshProducts();
      } else {
        setStatusMessage(json.error?.message || 'Failed to list product.');
      }
    } catch (err: any) {
      setStatusMessage('Error submitting product to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product from the database?')) return;

    try {
      const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        onRefreshProducts();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSaveStock = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_qty: newStockVal }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingStockId(null);
        onRefreshProducts();
      }
    } catch (err) {
      console.error('Update stock error:', err);
    }
  };

  if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
    return (
      <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 max-w-xl mx-auto p-6">
        <Package className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Merchant & Seller Portal</h2>
        <p className="text-xs text-slate-400">
          Sign in as a Seller account (e.g., <code className="text-purple-300">seller@abimart.com</code>) or register with role SELLER to manage inventory and list gaming products.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all"
        >
          Sign In as Seller
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Seller Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Merchant & Inventory Hub</h1>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-purple-300">{user.name}</strong> ({user.role})
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center space-x-2 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>List New Gaming Gear</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Listed Items</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{sellerProducts.length}</p>
          <span className="text-[10px] text-slate-500">Synchronized with products table</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Units in Stock</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400 font-mono">{totalStockUnits}</p>
          <span className="text-[10px] text-slate-500">Live inventory tracking</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Catalog Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {formatPrice(totalCatalogValueCents)}
          </p>
          <span className="text-[10px] text-slate-500">Calculated across warehouse</span>
        </div>
      </div>

      {/* Products Inventory Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Warehouse Inventory Management ({sellerProducts.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock Units</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sellerProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 flex items-center space-x-3">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate max-w-xs">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID #{p.id}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-300">{p.category}</td>
                  <td className="p-3 font-mono text-purple-300 font-semibold">{p.brand}</td>
                  <td className="p-3 font-mono font-bold text-white">{formatPrice(p.price_cents)}</td>
                  <td className="p-3">
                    {editingStockId === p.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={newStockVal}
                          onChange={(e) => setNewStockVal(Number(e.target.value))}
                          className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                        />
                        <button
                          onClick={() => handleSaveStock(p.id)}
                          className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-bold ${
                          p.stock_qty > 10 ? 'text-emerald-400' : p.stock_qty > 0 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {p.stock_qty}
                        </span>
                        <button
                          onClick={() => {
                            setEditingStockId(p.id);
                            setNewStockVal(p.stock_qty);
                          }}
                          className="p-1 text-slate-500 hover:text-white"
                          title="Quick edit stock"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                Seller Inventory Addition
              </span>
              <h3 className="text-xl font-bold text-white mt-1">List New Gaming Peripheral</h3>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wooting 80HE Hall Effect Keyboard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Keyboards">Keyboards</option>
                    <option value="Mice">Mice</option>
                    <option value="Audio">Audio</option>
                    <option value="Monitors">Monitors</option>
                    <option value="Controllers">Controllers</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={priceInr}
                    onChange={(e) => setPriceInr(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Marketing Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {statusMessage && (
                <p className="text-xs text-purple-300 font-semibold">{statusMessage}</p>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30"
                >
                  {submitting ? 'Inserting into SQLite...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
