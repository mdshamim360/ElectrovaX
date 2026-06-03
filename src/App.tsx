import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { AdminPanel } from './components/AdminPanel';
import { CheckoutSandbox } from './components/CheckoutSandbox';
import { RealTimeTracker } from './components/RealTimeTracker';
import { auth } from './firebase';
import { 
  ShoppingBag, 
  Trash2, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  Building,
  UserCheck,
  MapPin,
  ChevronLeft,
  Coins,
  ShieldAlert,
  Sparkles,
  ArrowRight
} from 'lucide-react';

function MainAppContent() {
  const { 
    user, 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    cartTotal, 
    discountedTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    products, 
    loadingProducts,
    addNotification
  } = useApp();

  const [activeRoute, setActiveRoute] = useState<string>(() => {
    // Recognize path-routing on window initialization
    const path = window.location.pathname;
    const search = window.location.search;
    if (path === '/checkout-sandbox') return 'checkout-sandbox';
    if (path === '/order-success') return 'order-success';
    if (path === '/payment-failed') return 'payment-failed';
    return 'home';
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkout shipping fields
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Form states for login/register
  const { login, register, loginWithGoogle } = useApp();
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Fill in default checkout parameters from authenticated profile
    if (user) {
      setShippingName(user.name);
      setShippingEmail(user.email);
    }
  }, [user]);

  // Support responsive tab change routing
  const navigateTo = (route: string) => {
    setActiveRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode) return;
    const res = applyCoupon(couponCode);
    if (res.success) {
      setCouponSuccess(res.message);
    } else {
      setCouponError(res.message);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!auth.currentUser) {
      addNotification('Sign In Required', 'Please create or log in to your account to complete checkout.', 'warn');
      navigateTo('auth');
      return;
    }

    if (!shippingName || !shippingPhone || !shippingAddress) {
      setCheckoutError('Please enter delivery full name, phone number, and street address.');
      return;
    }

    try {
      setCheckoutLoading(true);
      const token = await auth.currentUser.getIdToken();
      
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image
          })),
          customerName: shippingName,
          customerEmail: shippingEmail,
          customerPhone: shippingPhone,
          customerAddress: shippingAddress,
          totalAmount: discountedTotal,
          mockPayment: true // Fast execution mock sandbox flag
        })
      });

      const data = await res.json() as any;
      if (res.ok && data.gatewayPageURL) {
        // Redirection to standard simulation portal
        addNotification('Rerouting Payment', 'Connecting with secure billing gateway...', 'info');
        // If it starts with "/" (our mock router), navigate within React
        if (data.gatewayPageURL.startsWith('/')) {
          const params = new URLSearchParams(data.gatewayPageURL.split('?')[1]);
          window.history.pushState({}, '', data.gatewayPageURL);
          navigateTo('checkout-sandbox');
        } else {
          // Open dynamic external gateway
          window.location.href = data.gatewayPageURL;
        }
      } else {
        setCheckoutError(data.error || 'Failed to initialize payment gateway.');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment communication error.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        if (!authName) {
          setAuthError('Please fill in your name.');
          setAuthLoading(false);
          return;
        }
        await register(authEmail, authPass, authName);
      } else {
        await login(authEmail, authPass);
      }
      setAuthEmail('');
      setAuthPass('');
      setAuthName('');
      navigateTo('home');
    } catch (err: any) {
      setAuthError(err.message || 'Credentials authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Live filter product list based on searching and category row
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Electronics', 'Accessories', 'Smartphones', 'Wearables', 'Networking', 'Apparel', 'Home & Living'];

  // Formatted price utilities
  const formatBDTCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F6] dark:bg-slate-950 text-slate-800 dark:text-slate-350 transition-colors duration-200">
      
      {/* Dynamic Navbar */}
      <Navbar 
        onSearchChange={setSearchQuery} 
        searchQuery={searchQuery}
        onNavigate={navigateTo}
        activeRoute={activeRoute}
      />

      <main className="flex-grow">
        
        {/* VIEW 1: HOME PAGE */}
        {activeRoute === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
            
            {/* Left Side: Category Menu Sidebar (Sleek Interface spec) */}
            <div className="hidden lg:flex w-64 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-4 flex-col gap-1 self-start shrink-0">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3.5 px-1">
                Categories
              </h3>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all text-left ${selectedCategory === cat ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <span>{cat}</span>
                  <svg className={`w-3.5 h-3.5 ${selectedCategory === cat ? 'text-orange-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              ))}

              <div className="mt-6 p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl text-white shadow-sm">
                <p className="text-[9px] font-bold opacity-75 uppercase mb-1">PROMOTION CODE</p>
                <p className="text-sm font-black leading-tight">Apply EIDMUBARAK for 15% Savings</p>
                <p className="text-[10px] text-indigo-100 mt-1 lines-clamp-2">Enter code on checkout statements to unlock exclusive Dhaka campaign rewards.</p>
              </div>
            </div>

            {/* Right Side: Primary Content Stream */}
            <div className="flex-1 flex flex-col gap-4">
              
              {/* Sleek Hero Banner */}
              <div className="relative rounded-2xl bg-slate-900 text-white p-8 md:p-14 overflow-hidden shadow-sm min-h-[220px] flex items-center">
                {/* Background Art Panels */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 via-orange-550/75 to-transparent z-10" />
                <div className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/20 blur-3xl rounded-full z-0" />
                <div className="absolute right-20 top-1/2 -translate-y-1/2 w-36 h-36 border-4 border-white/10 rounded-full z-0" />
                
                <div className="relative z-20 max-w-lg">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md uppercase font-black text-[9px] tracking-widest rounded-full">
                    Dhaka EID Campaign Special
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-4 leading-none">
                    Grand Eid Shopping Festival 2026!
                  </h1>
                  <p className="text-[11px] text-orange-50/90 mt-3 font-medium leading-relaxed max-w-md">
                    Experience peerless discount rate checkouts on high-end tech accessories. Standard clearance refunds, rapid deliveries, and secure payment pathways.
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedCategory('Electronics')}
                      className="px-6 py-2.5 bg-white text-orange-600 hover:bg-orange-50 font-black text-xs rounded-lg shadow-xl cursor-pointer transition-colors"
                    >
                      Explore Electronics
                    </button>
                    <span className="text-[9.5px] font-bold text-orange-100 uppercase tracking-widest hidden sm:inline">
                      * Coupon Discounter Enabled
                    </span>
                  </div>
                </div>
              </div>

              {/* Horizontal Rails Category view for small screen sizes */}
              <div className="lg:hidden mb-2">
                <h3 className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 tracking-wider">Browse Product Categories</h3>
                <div className="flex gap-1.5 pb-1 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${selectedCategory === cat ? 'bg-orange-500 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Flash Sale Info Header Row */}
              <div className="flex items-center justify-between mt-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                  <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    {selectedCategory === 'All' ? 'Hot Flash Sale Products' : `${selectedCategory} Collection`}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-405 dark:text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">Campaign Ends In</span>
                  <div className="flex gap-1 text-white text-[11px] font-mono font-black">
                    <div className="w-6 h-6 bg-slate-800 dark:bg-slate-900 rounded flex items-center justify-center">12</div>
                    <div className="w-6 h-6 bg-slate-800 dark:bg-slate-900 rounded flex items-center justify-center">45</div>
                    <div className="w-6 h-6 bg-slate-800 dark:bg-slate-900 rounded flex items-center justify-center">23</div>
                  </div>
                </div>
              </div>

              {/* Products list loading states */}
              {loadingProducts ? (
                <div className="py-24 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-550 border-orange-500 mx-auto" />
                  <p className="text-xs text-slate-450 dark:text-slate-500 mt-4">Connecting server catalogue inventories...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
                  <p className="text-sm font-semibold text-slate-500">No products found matching active query filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl"
                  >
                    Reset Catalogue Filtration
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((prod) => (
                    <ProductCard 
                      key={prod.id} 
                      product={prod} 
                      onViewDetails={setSelectedProduct} 
                    />
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 2: CART & CHECKOUT PAGE */}
        {activeRoute === 'cart' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-black text-slate-850 dark:text-white mb-6 flex items-center gap-2">
              <ShoppingBag className="text-orange-500" /> Shopping Bag Statement
            </h1>

            {cart.length === 0 ? (
              <div className="p-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                <span className="text-4xl">🛒</span>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-4">Your Shopping bag is empty.</h3>
                <p className="text-xs text-slate-450 mt-1">Visit our homepage grid, explore products, and tap Add to Bag!</p>
                <button
                  onClick={() => navigateTo('home')}
                  className="mt-6 px-5 py-3 bg-orange-500 text-white font-bold text-xs rounded-xl shadow hover:bg-orange-600 transition-colors"
                >
                  Explore Products Catalog
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left: Cart Items List */}
                <div className="flex-1 space-y-4">
                  {cart.map((item) => (
                    <div 
                      key={item.product.id}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.01]"
                    >
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        referrerPolicy="no-referrer"
                        className="h-16 w-16 object-contain rounded bg-slate-50 dark:bg-slate-950 p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-850 dark:text-white truncate" title={item.product.name}>
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">{item.product.category}</p>
                        <p className="text-sm font-bold text-orange-600 dark:text-orange-500 mt-1">{formatBDTCurrency(item.product.price)}</p>
                      </div>

                      {/* Quantity adjusting controls */}
                      <div className="flex items-center gap-2 border border-slate-150 dark:border-slate-800 rounded-lg overflow-hidden shrink-0">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1.5 min-w-[16px] text-center dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 hover:bg-slate-50 hover:text-rose-650 text-slate-400 rounded-lg transition-colors shrink-0"
                        title="Remove from bag"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Coupon promotion card section */}
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Coupon Promotion Discounts</span>
                    
                    <form onSubmit={handleApplyCouponSubmit} className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="e.g. DARAZ20 or WELCOME500"
                        className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs dark:text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-slate-800 text-white dark:bg-slate-205 dark:text-slate-800 font-extrabold text-xs rounded-xl"
                      >
                        Apply Code
                      </button>
                    </form>

                    {couponError && <p className="text-[11px] text-red-500 font-semibold mt-2">{couponError}</p>}
                    {couponSuccess && <p className="text-[11px] text-emerald-500 font-semibold mt-2">{couponSuccess}</p>}

                    {appliedCoupon && (
                      <div className="mt-3.5 p-2 px-3 bg-orange-50 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/50 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-orange-700 dark:text-orange-450 font-mono">
                          🎁 Active Code: {appliedCoupon.code} (-{appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `৳${appliedCoupon.discountValue}`})
                        </span>
                        <button 
                          onClick={removeCoupon}
                          className="text-[10px] text-slate-405 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Shipping details form and grand checkout values */}
                <div className="w-full lg:w-96 space-y-6">
                  
                  {/* Shipping Form fields */}
                  <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Delivery Information</h3>
                    
                    {!auth.currentUser && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-xs font-semibold text-amber-700 dark:text-amber-400 rounded-xl">
                        🔒 Authenticate your shopping account before checking out.
                      </div>
                    )}

                    <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Customer Full Name</label>
                        <input
                          type="text"
                          required
                          value={shippingName}
                          onChange={e => setShippingName(e.target.value)}
                          placeholder="e.g. MD Shamim"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Mobile Contact Phone</label>
                        <input
                          type="tel"
                          required
                          value={shippingPhone}
                          onChange={e => setShippingPhone(e.target.value)}
                          placeholder="e.g. +8801700000000"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Street Address</label>
                        <textarea
                          required
                          rows={2}
                          value={shippingAddress}
                          onChange={e => setShippingAddress(e.target.value)}
                          placeholder="e.g. Road-1, Sector-5, Uttara, Dhaka"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs dark:text-white focus:outline-none"
                        />
                      </div>

                      {/* Total Calculations panel */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Basket Subtotal</span>
                          <span>{formatBDTCurrency(cartTotal)}</span>
                        </div>
                        
                        {appliedCoupon && (
                          <div className="flex justify-between text-emerald-500 font-semibold">
                            <span>Coupon Savings</span>
                            <span>
                              -{appliedCoupon.discountType === 'percentage' 
                                ? `${appliedCoupon.discountValue}%` 
                                : formatBDTCurrency(appliedCoupon.discountValue)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-slate-500">
                          <span>Estimated Delivery Courier</span>
                          <span className="text-emerald-500 font-bold">FREE Delivery</span>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-850 flex justify-between font-black text-slate-850 dark:text-white text-sm">
                          <span>Grand Total Payable</span>
                          <span className="text-orange-600 dark:text-orange-500">{formatBDTCurrency(discountedTotal)}</span>
                        </div>
                      </div>

                      {checkoutError && (
                        <div className="p-3 bg-red-50 text-red-650 text-xs font-semibold rounded-lg">
                          ⚠ {checkoutError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={checkoutLoading}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-450 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                      >
                        {checkoutLoading ? (
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <>
                            <CreditCard size={15} /> Place Checkout Statement
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                  
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW 3: USER LOGIN & REGISTER PANEL */}
        {activeRoute === 'auth' && (
          <div className="max-w-md mx-auto px-4 py-16">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-md">
              <div className="text-center mb-6">
                <h2 className="text-lg font-black text-slate-850 dark:text-white">
                  {isSignUp ? 'Create Shopper Profile' : 'Shopper Secure Sign In'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">Access order tracking, personal invoice billing registries, and checkout.</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      placeholder="e.g. Shamim"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/20 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="shoppers@example.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/20 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPass}
                    onChange={e => setAuthPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/20 dark:text-white"
                  />
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 text-red-650 text-xs font-semibold rounded-lg">
                    ⚠ {authError}
                  </div>
                )}

                {/* Info guidance to enable provider */}
                <p className="text-[9px] text-slate-400 leading-normal bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-lg">
                  💡 *Guidance: Make sure **Email/Password** and **Google** auth providers are enabled in your central Firebase console dashboard.*
                </p>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-orange-50s bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-450 text-white text-xs font-bold uppercase tracking-wide rounded-xl shadow transition-colors"
                >
                  {authLoading ? 'Authorizing...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-bold">or use single sign-on</span>
                  <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                </div>

                {/* Google SSO Login */}
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="w-full py-2.5 border border-slate-205 hover:bg-slate-50 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800/30 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  🌐 Sign In with Google Credentials
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs text-orange-500 hover:underline font-semibold"
                  >
                    {isSignUp ? 'Already registered? Login here' : 'New to Daraz? Register a profile here'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 4: ORDER TRACKING & HISTORY TAB */}
        {activeRoute === 'history' && (
          <RealTimeTracker />
        )}

        {/* VIEW 5: ADMIN CONFIG CONSOLE */}
        {activeRoute === 'admin' && (
          <AdminPanel />
        )}

        {/* VIEW 6: CHECKOUT SANDBOX PORTAL SIMULATOR */}
        {activeRoute === 'checkout-sandbox' && (
          <CheckoutSandbox />
        )}

        {/* VIEW 7: CHECKOUT SUCCESS SHEET */}
        {activeRoute === 'order-success' && (
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl shadow-lg space-y-6">
              <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto scale-110">
                <CheckCircle size={32} />
              </div>

              <div>
                <span className="px-2.5 py-1 text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 rounded-full dark:bg-emerald-900/50 dark:text-emerald-400">
                  Transaction Cleared
                </span>
                <h2 className="text-xl font-black mt-3 text-slate-850 dark:text-white">৳ Payment Succeeded!</h2>
                <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                  Your payment has been debited, and stock inventory was updated on the server. Your order invoice was logged.
                </p>
              </div>

              {/* Redirect Action track */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => navigateTo('history')}
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-600/10 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  Track Shipments
                </button>
                <button
                  onClick={() => navigateTo('home')}
                  className="w-full py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl transition-all"
                >
                  Back to Shopper Grid
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: CHECKOUT FAILURE SHEET */}
        {activeRoute === 'payment-failed' && (
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl shadow-lg space-y-6">
              <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-full flex items-center justify-center mx-auto scale-110">
                <XCircle size={32} />
              </div>

              <div>
                <span className="px-2.5 py-1 text-[9px] font-black uppercase bg-rose-100 text-rose-700 rounded-full dark:bg-rose-900/50 dark:text-rose-450">
                  Payment Decrypted FAILED
                </span>
                <h2 className="text-xl font-black mt-3 text-slate-850 dark:text-white">Transaction Aborted</h2>
                <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                  The payment session failed on SSLCommerz sandbox simulation. No charges were debited from your card.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => navigateTo('cart')}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow"
                >
                  Restart Checkout
                </button>
                <button
                  onClick={() => navigateTo('home')}
                  className="w-full py-3 text-slate-650 dark:text-slate-400 hover:bg-slate-50 text-xs font-bold rounded-xl"
                >
                  Back to Store
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Product Quick-View details overlay/modal sheet */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      {/* Bangladesh eCommerce Trust footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-slate-400 text-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-4">
            <span className="font-extrabold text-orange-500 uppercase tracking-wider">DARAZ.BD Secured</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="text-[11px]">24/7 Helpline Support: <b>+880 96 12 12 12</b></span>
          </div>
          <div className="flex items-center gap-6">
            <span onClick={() => navigateTo('admin')} className="text-[10px] font-black uppercase bg-slate-800 px-3.5 py-1.5 rounded text-white tracking-widest hover:bg-slate-700 cursor-pointer transition-colors block">
              Admin Console
            </span>
            <span className="text-[10.5px] font-bold text-slate-500">SSLCommerz Secured Settlement Partner</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
