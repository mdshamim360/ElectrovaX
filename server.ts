import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// Read config
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

const app = express();
const PORT = 3000;

// Self-contained custom CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize backend Firebase instance using Admin privileges
const adminApp = initializeApp({
  projectId: firebaseConfig.projectId
});
const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);

// Middleware to verify Firebase Identity ID token securely
async function authenticateUser(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token header.' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const lookupResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (!lookupResponse.ok) {
      throw new Error('Token verification failed');
    }
    const lookupData = await lookupResponse.json();
    const fireUser = lookupData.users?.[0];
    if (!fireUser) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Firebase user token.' });
    }
    req.user = {
      uid: fireUser.localId,
      email: fireUser.email,
      emailVerified: fireUser.emailVerified
    };
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Token is invalid.' });
  }
}

// Middleware to verify Admin permissions
async function requireAdmin(req: any, res: any, next: any) {
  await authenticateUser(req, res, async () => {
    try {
      const email = req.user.email;
      // Bootstrapped admin check
      if (email === "mdshamimbdyt0@gmail.com") {
        return next();
      }
      // Firestore admin check
      const userRef = db.collection('users').doc(req.user.uid);
      const userSnap = await userRef.get();
      if (userSnap.exists && userSnap.data()?.isAdmin === true) {
        return next();
      }
      return res.status(403).json({ error: 'Forbidden: Admin access only.' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal validation error.' });
    }
  });
}

// Ensure database is populated with elegant default Daraz-style products
async function bootstrapDB() {
  try {
    const productsCol = db.collection('products');
    const snapshot = await productsCol.get();
    if (snapshot.empty) {
      console.log('No products found, populating default Daraz marketplace products...');
      const defaultProducts = [
        {
          name: 'Sony WH-1000XM4 Wireless Active Noise Canceling Headphones',
          price: 28500,
          category: 'Electronics',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
          description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Edge-AI. Up to 30-hour battery life with quick charging. Custom touch control sensors.',
          stock: 12,
          featured: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Mechanical Gaming Keyboard Keychron K2 v2',
          price: 9200,
          category: 'Accessories',
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop',
          description: '75% Layout Wireless Mechanical Keyboard with Gateron switches, dual connectivity (Bluetooth & wired), Mac & Windows compatibility, and customizable RGB backlight options.',
          stock: 6,
          featured: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Baseus GaN5 Pro 65W Fast Charger Kit',
          price: 2400,
          category: 'Accessories',
          image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
          description: 'Type-C dual port with 65W GaN powerful technology. Charge your phone, tablet, and MacBook simultaneously with absolute thermal controls and quick charging adapters.',
          stock: 45,
          featured: false,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Redmi Note 13 Pro+ 5G (12GB/512GB)',
          price: 43500,
          category: 'Smartphones',
          image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop',
          description: 'Flagship 200MP Main Camera with OIS. 1.5K 120Hz AMOLED curved display. MediaTek Dimensity 7200-Ultra processor. IP68 dust and water resistance, and 120W HyperCharge.',
          stock: 14,
          featured: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Realme Watch 3 Active Smartwatch',
          price: 4999,
          category: 'Wearables',
          image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop',
          description: '1.83-inch large display, Bluetooth Calling with AI noise reduction. Over 110 sports modes with absolute heart-rate, SpO2, sleep, and fitness trace sensors.',
          stock: 22,
          featured: false,
          createdAt: new Date().toISOString()
        },
        {
          name: 'TP-Link Archer AX55 Dual-Band Wi-Fi 6 Router',
          price: 6800,
          category: 'Networking',
          image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600&auto=format&fit=crop',
          description: 'Next-Gen Gigabit Wi-Fi 6 Speed—2402 Mbps on 5 GHz and 574 Mbps on 2.4 GHz bands ensure smoother streaming and faster downloads. Connects up to 120+ devices with decreased latency.',
          stock: 18,
          featured: false,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Pure Cotton Slim Fit Casual Polo Shirt',
          price: 1350,
          category: 'Apparel',
          image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop',
          description: 'Made from high quality lightweight 100% combed cotton, dynamic mesh knit polo, double needle hemmed cuffs, ideal for year-around premium casual executive stylings.',
          stock: 30,
          featured: false,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Ergonomic Premium Leather Executive Office Chair',
          price: 18500,
          category: 'Home & Living',
          image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600&auto=format&fit=crop',
          description: 'High-back ergonomic office chair featuring top-grain genuine leather upholstery, adaptive lumbar support, synchronized seat reclining levers, metal alloy gas lift controls.',
          stock: 5,
          featured: true,
          createdAt: new Date().toISOString()
        }
      ];

      for (const prod of defaultProducts) {
        await productsCol.add(prod);
      }
      console.log('Successfully bootstrapped default products.');
    }
  } catch (error) {
    console.error('Error bootstrapping default products:', error);
  }
}
bootstrapDB();

// --- REST API ENDPOINTS ---

// 1. PRODUCTS API
app.get('/api/products', async (req, res) => {
  try {
    const productsCol = db.collection('products');
    const snapshot = await productsCol.get();
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);
    const snap = await productRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ id: snap.id, ...snap.data() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const { name, price, category, image, description, stock, featured } = req.body;
    if (!name || !price || !category || !image || !description || stock === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    const newProduct = {
      name: String(name),
      price: Number(price),
      category: String(category),
      image: String(image),
      description: String(description),
      stock: parseInt(String(stock)),
      featured: !!featured,
      createdAt: new Date().toISOString()
    };
    const productsCol = db.collection('products');
    const docRef = await productsCol.add(newProduct);
    return res.status(201).json({ id: docRef.id, ...newProduct });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { name, price, category, image, description, stock, featured } = req.body;
    const prodRef = db.collection('products').doc(req.params.id);
    const snap = await prodRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const updateData: any = {};
    if (name !== undefined) updateData.name = String(name);
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = String(category);
    if (image !== undefined) updateData.image = String(image);
    if (description !== undefined) updateData.description = String(description);
    if (stock !== undefined) updateData.stock = parseInt(String(stock));
    if (featured !== undefined) updateData.featured = !!featured;

    await prodRef.update(updateData);
    return res.json({ id: req.params.id, ...updateData });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const prodRef = db.collection('products').doc(req.params.id);
    const snap = await prodRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await prodRef.delete();
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. USERS API
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const usersCol = db.collection('users');
    const snapshot = await usersCol.get();
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. ORDERS API
app.get('/api/orders', authenticateUser, async (req: any, res) => {
  try {
    const email = req.user.email;
    const uid = req.user.uid;
    const ordersCol = db.collection('orders');
    
    // Check if the current user is admin
    let isAdminUser = false;
    if (email === "mdshamimbdyt0@gmail.com") {
      isAdminUser = true;
    } else {
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      if (userSnap.exists && userSnap.data()?.isAdmin === true) {
        isAdminUser = true;
      }
    }

    let snapshot;
    if (isAdminUser) {
      snapshot = await ordersCol.get();
    } else {
      snapshot = await ordersCol.where('userId', '==', uid).get();
    }

    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (!['pending', 'shipped', 'delivered'].includes(orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }
    const orderRef = db.collection('orders').doc(req.params.id);
    const snap = await orderRef.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    await orderRef.update({ orderStatus, updatedAt: new Date().toISOString() });
    return res.json({ id: req.params.id, orderStatus });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. PAYMENT & CHECKOUT API - SSLCOMMERZ INTEGRATION
// Initiate payment session
app.post('/api/payment/initiate', authenticateUser, async (req: any, res) => {
  try {
    const { 
      items, 
      customerName, 
      customerEmail, 
      customerPhone, 
      customerAddress, 
      totalAmount,
      mockPayment // flag if the user explicitly triggers mock fallback
    } = req.body;

    const userId = req.user.uid;

    if (!items || !items.length || !customerName || !customerPhone || !customerAddress || !totalAmount) {
      return res.status(400).json({ error: 'Missing checkout requirements.' });
    }

    // 1. Create a pending order in the database first
    const ordersCol = db.collection('orders');
    const tempOrder = {
      userId,
      customerName,
      customerEmail: customerEmail || req.user.email,
      customerPhone,
      customerAddress,
      items,
      totalAmount: Number(totalAmount),
      paymentStatus: 'pending',
      orderStatus: 'pending',
      paymentSessionId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const orderDoc = await ordersCol.add(tempOrder);
    const orderId = orderDoc.id;
    const tran_id = `TXN_${orderId}_${Date.now()}`;

    // Update payment callback URLs
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/api/payment/success?order_id=${orderId}&tran_id=${tran_id}`;
    const failUrl = `${baseUrl}/api/payment/fail?order_id=${orderId}&tran_id=${tran_id}`;
    const cancelUrl = `${baseUrl}/api/payment/cancel?order_id=${orderId}&tran_id=${tran_id}`;

    // If mock fallback is chosen, or if credentials are set to mock
    if (mockPayment) {
      // Return a URL pointing to our custom in-app checkout sandbox experience for maximum reliability
      const checkoutSandboxUrl = `/checkout-sandbox?order_id=${orderId}&tran_id=${tran_id}&total=${totalAmount}`;
      await db.collection('orders').doc(orderId).update({
        paymentSessionId: tran_id,
        updatedAt: new Date().toISOString()
      });
      return res.json({ gatewayPageURL: checkoutSandboxUrl });
    }

    // Attempt actual SSLCommerz Sandbox API initialization
    try {
      const payload = new URLSearchParams({
        store_id: 'testbox',
        store_passwd: 'testbox_pass',
        total_amount: String(totalAmount),
        currency: 'BDT',
        tran_id: tran_id,
        success_url: successUrl,
        fail_url: failUrl,
        cancel_url: cancelUrl,
        ipn_url: successUrl,
        cus_name: customerName,
        cus_email: customerEmail || 'test@example.com',
        cus_phone: customerPhone,
        cus_add1: customerAddress,
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1212',
        cus_country: 'Bangladesh',
        shipping_method: 'NO',
        product_name: 'eCommerce Order',
        product_category: 'General',
        product_profile: 'general'
      });

      const response = await fetch('https://sandbox.sslcommerz.com/gwprocess/v4/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString()
      });

      const sslData = await response.json() as any;

      if (sslData.status === 'SUCCESS' && sslData.GatewayPageURL) {
        // Successful real integration registration
        await db.collection('orders').doc(orderId).update({
          paymentSessionId: sslData.sessionkey,
          updatedAt: new Date().toISOString()
        });
        return res.json({ gatewayPageURL: sslData.GatewayPageURL });
      } else {
        // Fallback to our custom checkout sandbox URL immediately if sandbox server returns failure
        console.warn('SSLCommerz gateway returned non-success, using mock fallback', sslData);
        const checkoutSandboxUrl = `/checkout-sandbox?order_id=${orderId}&tran_id=${tran_id}&total=${totalAmount}`;
        await db.collection('orders').doc(orderId).update({
          paymentSessionId: tran_id,
          updatedAt: new Date().toISOString()
        });
        return res.json({ gatewayPageURL: checkoutSandboxUrl });
      }
    } catch (sslErr) {
      // In case of network errors or offline, fall back to robust custom simulation URL
      console.warn('SSLCommerz API error, falling back', sslErr);
      const checkoutSandboxUrl = `/checkout-sandbox?order_id=${orderId}&tran_id=${tran_id}&total=${totalAmount}`;
      await db.collection('orders').doc(orderId).update({
        paymentSessionId: tran_id,
        updatedAt: new Date().toISOString()
      });
      return res.json({ gatewayPageURL: checkoutSandboxUrl });
    }
  } catch (error: any) {
    console.error('Error initiating checkout:', error);
    return res.status(500).json({ error: error.message });
  }
});

// SUCCESS CALLBACK endpoint (POST handles web hooks, GET handles visual redirects if needed)
app.all('/api/payment/success', async (req, res) => {
  const orderId = String(req.query.order_id || req.body.order_id || req.body.value_a);
  const tranId = String(req.query.tran_id || req.body.tran_id);

  console.log('Payment success callback trigger:', { orderId, tranId });

  if (!orderId || orderId === 'undefined') {
    return res.redirect('/payment-failed?error=MissingOrderRef');
  }

  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    if (orderSnap.exists) {
      const orderData = orderSnap.data();
      // Only fulfill order and decrease stock if it's currently pending
      if (orderData?.paymentStatus === 'pending') {
        // 1. Mark payment as absolute success
        await orderRef.update({
          paymentStatus: 'success',
          updatedAt: new Date().toISOString()
        });

        // 2. Safely deduct product stock from database
        const items = orderData.items || [];
        for (const item of items) {
          try {
            const productRef = db.collection('products').doc(item.productId);
            const productSnap = await productRef.get();
            if (productSnap.exists) {
              const currentStock = Number(productSnap.data()?.stock || 0);
              const deductQty = Number(item.quantity || 1);
              const nextStock = Math.max(0, currentStock - deductQty);
              await productRef.update({ stock: nextStock });
            }
          } catch (stockErr) {
            console.error(`Failed to adjust stock for product ${item.productId}:`, stockErr);
          }
        }
      }
    }
    // Redirect client browser tab back to our success screen
    return res.redirect(`/order-success?id=${orderId}`);
  } catch (error: any) {
    console.error('Success callback exception error:', error);
    return res.redirect(`/payment-failed?error=${encodeURIComponent(error.message)}`);
  }
});

// FAIL CALLBACK
app.all('/api/payment/fail', async (req, res) => {
  const orderId = String(req.query.order_id || req.body.order_id);
  console.log('Payment failed callback trigger:', { orderId });
  try {
    if (orderId && orderId !== 'undefined') {
      const orderRef = db.collection('orders').doc(orderId);
      await orderRef.update({
        paymentStatus: 'failed',
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Error handling payment failure in DB:', err);
  }
  return res.redirect('/payment-failed');
});

// CANCEL CALLBACK
app.all('/api/payment/cancel', async (req, res) => {
  return res.redirect('/');
});


// --- INTEGRATE VITE FOR FE/BE OR SERVING COMPILED APP ---

const isProd = process.env.NODE_ENV === 'production';

async function bootstrapServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: process.cwd()
    });
    app.use(vite.middlewares);
  } else {
    // Production files distribution static mounting
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to port 3000 and 0.0.0.0
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express Fullstack Server running on http://localhost:${PORT}`);
  });
}

bootstrapServer().catch(err => {
  console.error("Failed to start server:", err);
});
