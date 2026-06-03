import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Product, CartItem, UserProfile, Coupon } from '../types';

interface AppContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loadingAuth: boolean;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  discountedTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  products: Product[];
  loadingProducts: boolean;
  fetchProducts: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addNotification: (title: string, desc: string, type?: 'info' | 'success' | 'warn') => void;
  notifications: any[];
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('daraz_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  // Coupons
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Theme
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('daraz_dark_mode') === 'true';
  });

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // In-app Notification list (Simulating Real-time Push logs)
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('daraz_cart_items', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('daraz_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync firestore user details during auth lifecycle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fireUser) => {
      setFirebaseUser(fireUser);
      if (fireUser) {
        try {
          const userDocRef = doc(db, 'users', fireUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUser({ id: snap.id, ...snap.data() } as any);
          } else {
            // Setup a default profile if it does not yet exist
            const newProfile: UserProfile = {
              uid: fireUser.uid,
              email: fireUser.email || '',
              name: fireUser.displayName || 'Marketplace User',
              isAdmin: fireUser.email === 'mdshamimbdyt0@gmail.com', // bootstrap admin
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUser(newProfile);
          }
        } catch (e) {
          console.error("Auth profile synchronizer failed:", e);
          // Fallback UI profile in case rules aren't active or DB isn't writing
          setUser({
            uid: fireUser.uid,
            email: fireUser.email || '',
            name: fireUser.displayName || 'Marketplace User',
            isAdmin: fireUser.email === 'mdshamimbdyt0@gmail.com'
          });
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const addNotification = (title: string, desc: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const newLog = {
      id: String(Date.now()),
      title,
      desc,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications((prev) => [newLog, ...prev]);
    
    // Simulate real browser Notification API where allowed
    if (Notification.permission === 'granted') {
      new Notification(title, { body: desc });
    }
  };

  const clearNotifications = () => setNotifications([]);

  // Fetch product list from REST API
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Prompt browser for push notifications setup
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // CART OPERATIONS
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          addNotification('Stock limit!', `Only ${product.stock} items left in stock.`, 'warn');
          return prev;
        }
        addNotification('Quantity Updated', `${product.name} quantity in cart is now ${nextQty}.`, 'success');
        return prev.map((item) => 
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      addNotification('Added to Cart', `${product.name} added to your shopping bag.`, 'success');
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addNotification('Removed from Bag', 'Item removed from your cart bag.', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const prod = cart.find(item => item.product.id === productId)?.product;
    if (!prod) return;
    if (quantity > prod.stock) {
      addNotification('Stock LimitReached', `Only ${prod.stock} items available in stock.`, 'warn');
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => 
      prev.map((item) => item.product.id === productId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Apply Coupon mechanics
  const availableCoupons: Coupon[] = [
    { code: 'DARAZ20', discountType: 'percentage', discountValue: 20, active: true },
    { code: 'WELCOME500', discountType: 'fixed', discountValue: 500, active: true },
    { code: 'EIDMUBARAK', discountType: 'percentage', discountValue: 15, active: true }
  ];

  const applyCoupon = (code: string) => {
    const formatted = code.toUpperCase().trim();
    const coup = availableCoupons.find(c => c.code === formatted);
    if (!coup) {
      return { success: false, message: 'Invalid coupon code.' };
    }
    if (!coup.active) {
      return { success: false, message: 'This coupon has expired.' };
    }
    setAppliedCoupon(coup);
    addNotification('Coupon Applied!', `You saved with checkout coupon ${formatted}!`, 'success');
    return { success: true, message: 'Coupon applied successfully!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const getDiscountedTotal = () => {
    if (!appliedCoupon) return cartTotal;
    if (appliedCoupon.discountType === 'percentage') {
      const discount = (cartTotal * appliedCoupon.discountValue) / 100;
      return Math.max(0, cartTotal - discount);
    } else {
      return Math.max(0, cartTotal - appliedCoupon.discountValue);
    }
  };

  const discountedTotal = getDiscountedTotal();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // CLIENT AUTH HOOK LOGICS
  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    addNotification('Logged In', 'Welcome back! Login session successfully verified.', 'success');
  };

  const register = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    // Write profile data to Firestore
    const userDocRef = doc(db, 'users', cred.user.uid);
    const profile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      name,
      isAdmin: email === 'mdshamimbdyt0@gmail.com', // bootstrap user check
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, profile);
    setUser(profile);
    addNotification('Profile Created', 'Your Daraz account was registered successfully!', 'success');
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    addNotification('Google Sign-in', `Logged in dynamically as ${cred.user.displayName}`, 'success');
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    addNotification('Logged Out', 'Your session was securely terminated.', 'info');
  };

  return (
    <AppContext.Provider value={{
      user,
      firebaseUser,
      loadingAuth,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      discountedTotal,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      darkMode,
      toggleDarkMode,
      products,
      loadingProducts,
      fetchProducts,
      login,
      register,
      loginWithGoogle,
      logout,
      addNotification,
      notifications,
      clearNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
};
