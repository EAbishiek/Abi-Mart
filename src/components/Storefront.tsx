import React, { useState, useMemo } from 'react';
import { Product, Review, UserResponseDto } from '../types';
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Zap, 
  CheckCircle2, 
  SlidersHorizontal, 
  Info, 
  X, 
  MessageSquare, 
  Send,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface StorefrontProps {
  products: Product[];
  categories: string[];
  brands: string[];
  user: UserResponseDto | null;
  currency: 'INR' | 'USD';
  onAddToCart: (product: Product, quantity?: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefreshProducts: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  categories,
  brands,
  user,
  currency,
  onAddToCart,
  searchQuery,
  setSearchQuery,
  onRefreshProducts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Review state for modal
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string>('');

  // Currency Converter Helper
  const formatPrice = (cents: number) => {
    if (currency === 'USD') {
      const usd = cents / 8500;
      return `$${usd.toFixed(2)}`;
    }
    const inr = Math.round(cents / 100);
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'All' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }
      // Stock filter
      if (inStockOnly && p.stock_qty <= 0) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesBrand && !matchesCat) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price_cents - b.price_cents;
      if (sortBy === 'price_desc') return b.price_cents - a.price_cents;
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.id - b.id; // Featured default
    });
  }, [products, selectedCategory, selectedBrand, inStockOnly, searchQuery, sortBy]);

  // Load reviews when opening product modal
  const openProductModal = async (product: Product) => {
    setSelectedProduct(product);
    setLoadingReviews(true);
    setReviewMessage('');
    try {
      const res = await fetch(`/api/v1/products/${product.id}/reviews`);
      const json = await res.json();
      if (json.success && json.data?.reviews) {
        setReviews(json.data.reviews);
      } else {
        setReviews([]);
      }
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newReviewComment.trim()) return;

    if (!user) {
      setReviewMessage('Please sign in to submit a review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/v1/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: newReviewRating,
          comment: newReviewComment.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.review) {
        setReviews([json.data.review, ...reviews]);
        setNewReviewComment('');
        setReviewMessage('Your verified review was published!');
        onRefreshProducts();
      } else {
        setReviewMessage(json.error?.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      setReviewMessage('Error submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Parse specs json helper
  const renderSpecs = (specsJsonStr: string) => {
    try {
      const specs = JSON.parse(specsJsonStr || '{}');
      const entries = Object.entries(specs);
      if (entries.length === 0) return null;

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
          {entries.map(([key, val]) => (
            <div key={key} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">{key}:</span>
              <span className="text-slate-200 font-mono font-bold text-right ml-2">{String(val)}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Esports Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-indigo-900/40 p-6 md:p-10 shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>OFFICIAL CAPSTONE GAMING GEAR MARKETPLACE</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              LEVEL UP YOUR <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">BATTLESTATION</span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Explore pro-grade esports hardware: Hall Effect analog keyboards with Rapid Trigger, 
              ultra-lightweight 8000Hz gaming mice, audiophile ANC headsets, and 240Hz OLED monitors.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => { setSelectedCategory('Keyboards'); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 hover:scale-105 flex items-center space-x-1.5"
              >
                <span>Analog Keyboards</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => { setSelectedCategory('Mice'); }}
                className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all hover:scale-105 flex items-center space-x-1.5"
              >
                <span>Esports Mice</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => { setSelectedCategory('Monitors'); }}
                className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all hover:scale-105 flex items-center space-x-1.5"
              >
                <span>240Hz OLED Displays</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Promo code card */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 backdrop-blur-md max-w-sm w-full space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Active Gamer Coupons
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                VERIFIED
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-mono font-bold text-white">GAMER10</span>
                  <p className="text-[11px] text-slate-400">10% Off Any Order</p>
                </div>
                <span className="text-[10px] text-indigo-400 font-mono">Min ₹999</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-mono font-bold text-white">ABIPRO</span>
                  <p className="text-[11px] text-slate-400">Flat ₹500 Instant Discount</p>
                </div>
                <span className="text-[10px] text-indigo-400 font-mono">Min ₹4,999</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Apply at checkout drawer for instant price deductions.
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'Keyboards', 'Mice', 'Audio', 'Monitors', 'Controllers', 'Accessories'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat === 'All' ? '⚡ All Gaming Gear' : cat}
          </button>
        ))}
      </div>

      {/* Filter and Controls Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Selector */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Brand:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-full md:w-auto"
          >
            <option value="All">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* In-Stock Toggle */}
        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
          />
          <span>In-Stock Only</span>
        </label>

        {/* Sort Options */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="featured">Featured Picks</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated ⭐</option>
          </select>

          {(selectedCategory !== 'All' || selectedBrand !== 'All' || inStockOnly || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedBrand('All');
                setInStockOnly(false);
                setSearchQuery('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 underline font-semibold ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing <strong className="text-white">{filteredProducts.length}</strong> high-performance gaming items</span>
        <span className="font-mono text-[11px] text-emerald-400 flex items-center">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Live SQLite Database Connected
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <SlidersHorizontal className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No products found matching filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or selecting a different brand/category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBrand('All');
              setInStockOnly(false);
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500"
          >
            Show All Gear
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="group bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {prod.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-600/90 text-white shadow-md">
                        {prod.badge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-slate-300 border border-slate-700/80">
                      {prod.category}
                    </span>
                  </div>

                  {/* Brand Tag */}
                  <div className="absolute bottom-2.5 left-3">
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      {prod.brand}
                    </span>
                  </div>

                  {/* Rating Chip */}
                  <div className="absolute bottom-2.5 right-3 flex items-center space-x-1 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700 text-amber-400 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{prod.rating.toFixed(1)}</span>
                    <span className="text-slate-400 text-[10px]">({prod.reviews_count})</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <h3 
                    onClick={() => openProductModal(prod)}
                    className="font-bold text-white text-sm line-clamp-1 hover:text-indigo-300 cursor-pointer transition-colors"
                  >
                    {prod.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>

                  {/* Stock counter */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className={`font-semibold ${
                      prod.stock_qty > 10 ? 'text-emerald-400' : prod.stock_qty > 0 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {prod.stock_qty > 10 ? `● In Stock (${prod.stock_qty} units)` : prod.stock_qty > 0 ? `● Low Stock (${prod.stock_qty} left)` : '● Out of Stock'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">ID #{prod.id}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Price & Actions */}
              <div className="p-5 pt-0">
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">PRICE</span>
                    <span className="text-lg font-black text-white font-mono">
                      {formatPrice(prod.price_cents)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openProductModal(prod)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors"
                      title="View Tech Specs & Reviews"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      disabled={prod.stock_qty <= 0}
                      onClick={() => onAddToCart(prod)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 hover:scale-105 active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Details & Specs Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Product Image */}
                <div className="w-full md:w-1/2 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Basic Details */}
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                      {selectedProduct.brand}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {selectedProduct.category}
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                    {selectedProduct.name}
                  </h2>

                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(selectedProduct.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-bold">{selectedProduct.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({selectedProduct.reviews_count} verified reviews)</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">PRICE</span>
                      <span className="text-2xl font-black text-white font-mono">
                        {formatPrice(selectedProduct.price_cents)}
                      </span>
                    </div>

                    <button
                      disabled={selectedProduct.stock_qty <= 0}
                      onClick={() => {
                        onAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hardware Specifications */}
              <div className="space-y-2 border-t border-slate-800 pt-5">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Technical Hardware Specifications</span>
                </h4>
                {renderSpecs(selectedProduct.specs_json)}
              </div>

              {/* Customer Reviews Section */}
              <div className="space-y-4 border-t border-slate-800 pt-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Customer Reviews ({reviews.length})</span>
                  </h4>
                </div>

                {/* Review Submission Form */}
                <form onSubmit={handleReviewSubmit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Write a Review:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className="p-0.5 text-amber-400"
                        >
                          <Star className={`w-4 h-4 ${star <= newReviewRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder={user ? "Share your esports gaming experience with this item..." : "Sign in to post your review..."}
                    disabled={!user}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  {reviewMessage && (
                    <p className="text-[11px] text-emerald-400 font-semibold">{reviewMessage}</p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!user || submittingReview || !newReviewComment.trim()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{submittingReview ? 'Posting...' : 'Post Review'}</span>
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                {loadingReviews ? (
                  <p className="text-xs text-slate-500">Loading verified reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-xs text-slate-500">No reviews yet for this product. Be the first to review!</p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{rev.user_name}</span>
                          <div className="flex items-center space-x-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300">{rev.comment}</p>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
