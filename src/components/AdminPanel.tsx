import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, UserProfile } from '../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  UserPlus, 
  RefreshCw, 
  DollarSign, 
  Archive,
  UserCheck,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { auth } from '../firebase';

export const AdminPanel: React.FC = () => {
  const { user, products, fetchProducts, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');
  
  // API loading & lists
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Product Form states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [featured, setFeatured] = useState(false);

  const [formError, setFormError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Sort orders newest first
        const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(sorted);
      }
    } catch (e) {
      console.error('Error fetching admin orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Error fetching admin users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchOrders();
      fetchUsers();
    }
  }, [user]);

  const handleResetForm = () => {
    setName('');
    setPrice('');
    setCategory('Electronics');
    setImage('');
    setDescription('');
    setStock('');
    setFeatured(false);
    setSelectedProductId(null);
    setIsEditing(false);
    setFormError('');
  };

  // Trigger values input for Edit Mode
  const handleTriggerEdit = (prod: Product) => {
    setIsEditing(true);
    setSelectedProductId(prod.id);
    setName(prod.name);
    setPrice(String(prod.price));
    setCategory(prod.category);
    setImage(prod.image);
    setDescription(prod.description);
    setStock(String(prod.stock));
    setFeatured(!!prod.featured);
  };

  const handleSubmitProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !price || !category || !image || !description || stock === '') {
      setFormError('Please fill in all product specifications.');
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const payload = {
        name,
        price: Number(price),
        category,
        image,
        description,
        stock: parseInt(stock),
        featured
      };

      const url = isEditing ? `/api/products/${selectedProductId}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addNotification(
          isEditing ? 'Product Modified' : 'Product Added',
          `${name} was updated successfully in the Daraz catalogue.`,
          'success'
        );
        handleResetForm();
        fetchProducts();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Request failed.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network communication error.');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${productName}? This is permanent!`)) {
      return;
    }
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        addNotification('Catalogue Deleted', `${productName} was removed.`, 'info');
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'pending' | 'shipped' | 'delivered') => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: status })
      });

      if (res.ok) {
        addNotification('Order Status Shifted', `Order #${orderId.substring(0, 6)} is now ${status}.`, 'info');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="h-16 w-16 bg-red-100 dark:bg-rose-950/40 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Admin Console Locked</h2>
        <p className="text-xs text-slate-500 mt-2">You must log in with an authorized admin account to view this view.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Performance KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
            <h3 className="text-xl font-black mt-1 text-slate-850 dark:text-white">
              {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(
                orders.filter(o => o.paymentStatus === 'success').reduce((sum, o) => sum + o.totalAmount, 0)
              )}
            </h3>
          </div>
          <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            ৳
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Store Products</span>
            <h3 className="text-xl font-black mt-1 text-slate-850 dark:text-white">{products.length}</h3>
          </div>
          <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/35 text-blue-600 rounded-xl flex items-center justify-center">
            <Package size={18} />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Orders</span>
            <h3 className="text-xl font-black mt-1 text-slate-850 dark:text-white">{orders.length}</h3>
          </div>
          <div className="h-10 w-10 bg-orange-50 dark:bg-orange-950/35 text-orange-600 rounded-xl flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Platform Users</span>
            <h3 className="text-xl font-black mt-1 text-slate-850 dark:text-white">{users.length}</h3>
          </div>
          <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/35 text-amber-600 rounded-xl flex items-center justify-center">
            <UserCheck size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Sidebar navigation tab toggles */}
        <div className="w-full lg:w-1/4 flex flex-row lg:flex-col gap-2 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-4 lg:pb-0 lg:pr-6 shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 lg:flex-initial flex items-center gap-2.5 px-4 py-3 text-xs font-bold rounded-xl text-left transition-colors ${activeTab === 'products' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Package size={16} />
            Manage Catalogue
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 lg:flex-initial flex items-center gap-2.5 px-4 py-3 text-xs font-bold rounded-xl text-left transition-colors ${activeTab === 'orders' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Clock size={16} />
            Manage Orders ({orders.filter(o => o.orderStatus === 'pending').length} pending)
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 lg:flex-initial flex items-center gap-2.5 px-4 py-3 text-xs font-bold rounded-xl text-left transition-colors ${activeTab === 'users' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <UserCheck size={16} />
            Customer Directory
          </button>
        </div>

        {/* Right Side: Tab Contents panel */}
        <div className="flex-1">
          
          {/* TAB 1: PRODUCT CATALOGUE */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Add / Edit Form panel */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    {isEditing ? <Edit size={16} /> : <Plus size={16} />}
                    {isEditing ? 'Modify Active Product' : 'Registry New Product'}
                  </h4>
                  {isEditing && (
                    <button 
                      onClick={handleResetForm}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmitProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-450 mb-1.5 dark:text-slate-450">Product Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Mechanical Keyboard"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-450 mb-1.5 dark:text-slate-450">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                    >
                      <option>Electronics</option>
                      <option>Accessories</option>
                      <option>Smartphones</option>
                      <option>Wearables</option>
                      <option>Networking</option>
                      <option>Apparel</option>
                      <option>Home & Living</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-450 mb-1.5 dark:text-slate-450">Price (BDT ৳)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-450 mb-1.5 dark:text-slate-450">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={e => setStock(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-450 mb-1.5 dark:text-slate-450">Image URL</label>
                    <input
                      type="url"
                      required
                      value={image}
                      onChange={e => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-450 mb-1.5 dark:text-slate-450">Product Description</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Write brief descriptive specifications..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-orange-500/30 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-800 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="featured" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mark as Best Seller (Featured)
                    </label>
                  </div>

                  {formError && (
                    <div className="md:col-span-2 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg flex items-center">
                      ⚠ {formError}
                    </div>
                  )}

                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400 text-xs font-semibold rounded-xl"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl shadow shadow-orange-500/10"
                    >
                      {isEditing ? 'Update Catalogue' : 'Publish Product'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Catalogue Listing */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Catalogue Directory ({products.length} Items)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-4">Thumbnail</th>
                        <th className="p-4">Product Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {products.map((prod) => (
                        <tr key={prod.id} className="text-xs text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="p-4">
                            <img 
                              src={prod.image} 
                              alt="" 
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 object-contain rounded bg-slate-100 dark:bg-slate-950 p-0.5" 
                            />
                          </td>
                          <td className="p-4 font-semibold max-w-[240px] truncate" title={prod.name}>
                            {prod.name}
                          </td>
                          <td className="p-4 uppercase tracking-wider text-[10px] text-slate-400">{prod.category}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">৳ {prod.price}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded font-bold ${prod.stock === 0 ? 'bg-red-50 text-red-650' : 'bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-300'}`}>
                              {prod.stock}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleTriggerEdit(prod)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                                title="Edit specs"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-1.5 text-red-550 hover:bg-red-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                                title="Delete product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SYSTEM ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">System Transaction Logs</span>
                <button 
                  onClick={fetchOrders}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-500 transition-colors"
                  title="Reload table"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {loadingOrders ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">No checkout transactions recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                        <th className="p-4">Txn Details</th>
                        <th className="p-4">Delivery Customer</th>
                        <th className="p-4">Checkout Items</th>
                        <th className="p-4">Grand Total</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Order Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {orders.map((o) => (
                        <tr key={o.id} className="text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="p-4">
                            <p className="font-extrabold text-slate-850 dark:text-white mb-1">
                              #{o.id.substring(0, 8).toUpperCase()}
                            </p>
                            <p className="text-[10px] text-slate-400 leading-none">
                              {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="p-4 space-y-1">
                            <p className="font-bold flex items-center gap-1"><UserCheck size={12} className="text-slate-400" /> {o.customerName}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1"><Mail size={11} /> {o.customerEmail}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1"><Phone size={11} /> {o.customerPhone}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 max-w-[180px] break-words"><MapPin size={11} className="shrink-0" /> {o.customerAddress}</p>
                          </td>
                          <td className="p-4 space-y-1">
                            {o.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-1 last:border-0 last:pb-0">
                                <span className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-[10px] font-bold">x{item.quantity}</span>
                                <span className="text-[11px] truncate max-w-[140px]" title={item.name}>{item.name}</span>
                              </div>
                            ))}
                          </td>
                          <td className="p-4 font-black text-slate-850 dark:text-white">
                            ৳ {o.totalAmount}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.paymentStatus === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : o.paymentStatus === 'failed' ? 'bg-rose-50 text-rose-600 dark:bg-rose-955/20' : 'bg-slate-100 text-slate-650'}`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {/* Actions Dropdown select dropdown */}
                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                              className="p-1 px-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-700 dark:text-zinc-300 focus:outline-none"
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="shipped">🚚 Shipped</option>
                              <option value="delivered">✅ Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGISTERED CUSTOMERS */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Registered Accounts Directory</span>
              </div>

              {loadingUsers ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading directory...</div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">No customers registered in database yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Registration UID</th>
                        <th className="p-4">Linked Email</th>
                        <th className="p-4">Authorization Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {users.map((u) => (
                        <tr key={u.uid} className="text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="p-4 font-bold flex items-center gap-1.5">
                            <span className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-500 font-black text-[10px] flex items-center justify-center">
                              {u.name.substring(0,2).toUpperCase()}
                            </span>
                            {u.name}
                          </td>
                          <td className="p-4 font-mono text-[10px] text-slate-400" title={u.uid}>{u.uid.substring(0, 10)}...</td>
                          <td className="p-4 truncate max-w-[200px]" title={u.email}>{u.email}</td>
                          <td className="p-4">
                            {u.isAdmin ? (
                              <span className="px-2 py-0.5 bg-red-105 text-red-650 text-[9px] font-black uppercase rounded dark:bg-rose-950/40">
                                Admin Coach
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-505 text-[9px] font-black uppercase rounded dark:bg-slate-800 dark:text-slate-400">
                                Shopper Customer
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
