import express, { Request, Response } from 'express';
import { db, seedInitialData } from './db.ts';

export const apiRouter = express.Router();
apiRouter.use(express.json({ limit: '15mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT 1 as alive').get() as { alive: number };
    res.json({ status: 'ok', database: 'SQLite 3 (WAL mode)', alive: row.alive === 1 });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==================== PRODUCTS ====================

apiRouter.get('/products', (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: (string | number)[] = [];

    if (category && category !== 'Semua') {
      query += ' AND category = ?';
      params.push(String(category));
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR material LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const rows = (stmt.all(...params) as any[]).map((p) => ({
      ...p,
      sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
      colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
    }));

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', details: String(error) });
  }
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const row = stmt.get(req.params.id) as any;
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    row.sizes = typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes;
    row.colors = typeof row.colors === 'string' ? JSON.parse(row.colors) : row.colors;
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product', details: String(error) });
  }
});

// Admin Add Product
apiRouter.post('/products', (req: Request, res: Response) => {
  try {
    const { name, category, price, stock, description, image_url, sizes, colors, material } = req.body;
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Nama, kategori, harga, dan stok wajib diisi' });
    }

    const id = 'hos-prod-' + Date.now();
    const sizesJson = JSON.stringify(Array.isArray(sizes) ? sizes : ['S', 'M', 'L']);
    const colorsJson = JSON.stringify(Array.isArray(colors) ? colors : ['Standard']);
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO products (id, name, category, price, stock, description, image_url, sizes, colors, material, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name,
      category,
      Number(price),
      Number(stock),
      description || '',
      image_url || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      sizesJson,
      colorsJson,
      material || 'Katun Silky',
      createdAt
    );

    res.status(201).json({ success: true, id, message: 'Produk berhasil ditambahkan' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', details: String(error) });
  }
});

// Admin Update Product
apiRouter.put('/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description, image_url, sizes, colors, material } = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedSizes = sizes ? JSON.stringify(Array.isArray(sizes) ? sizes : [sizes]) : existing.sizes;
    const updatedColors = colors ? JSON.stringify(Array.isArray(colors) ? colors : [colors]) : existing.colors;

    const stmt = db.prepare(`
      UPDATE products SET
        name = ?,
        category = ?,
        price = ?,
        stock = ?,
        description = ?,
        image_url = ?,
        sizes = ?,
        colors = ?,
        material = ?
      WHERE id = ?
    `);

    stmt.run(
      name ?? existing.name,
      category ?? existing.category,
      price !== undefined ? Number(price) : existing.price,
      stock !== undefined ? Number(stock) : existing.stock,
      description ?? existing.description,
      image_url ?? existing.image_url,
      updatedSizes,
      updatedColors,
      material ?? existing.material,
      id
    );

    res.json({ success: true, message: 'Produk berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product', details: String(error) });
  }
});

// Admin Delete Product
apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(id);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product', details: String(error) });
  }
});

// ==================== ORDERS & CHECKOUT ====================

// Create Order (Checkout)
apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      city,
      postal_code,
      items,
      shipping_fee = 0,
      discount = 0,
      payment_method = 'Transfer Bank BCA',
      notes = ''
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !customer_address || !items || !items.length) {
      return res.status(400).json({ error: 'Data pembeli dan barang belanjaan wajib lengkap' });
    }

    // Check stock for all items
    for (const item of items) {
      const prod = db.prepare('SELECT stock, name FROM products WHERE id = ?').get(item.id) as any;
      if (!prod) {
        return res.status(400).json({ error: `Produk "${item.name}" tidak ditemukan` });
      }
      if (prod.stock < item.quantity) {
        return res.status(400).json({
          error: `Stok untuk "${prod.name}" tersisa ${prod.stock}, tidak mencukupi untuk pesanan ${item.quantity}`
        });
      }
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    const total_amount = Math.max(0, subtotal + Number(shipping_fee) - Number(discount));

    // Find or create customer
    let customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(customer_email) as any;
    let customer_id = '';

    if (!customer) {
      customer_id = 'cust-' + Date.now();
      db.prepare(`
        INSERT INTO customers (id, name, email, phone, address, city, postal_code, total_orders, total_spent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        city || 'Indonesia',
        postal_code || '',
        1,
        total_amount,
        new Date().toISOString()
      );
    } else {
      customer_id = customer.id;
      db.prepare(`
        UPDATE customers SET
          name = ?,
          phone = ?,
          address = ?,
          city = COALESCE(?, city),
          postal_code = COALESCE(?, postal_code),
          total_orders = total_orders + 1,
          total_spent = total_spent + ?
        WHERE id = ?
      `).run(
        customer_name,
        customer_phone,
        customer_address,
        city || customer.city,
        postal_code || customer.postal_code,
        total_amount,
        customer_id
      );
    }

    // Decrement stock for all items
    const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    for (const item of items) {
      updateStockStmt.run(item.quantity, item.id);
    }

    // Generate Order ID (e.g. HOS-20261013-4821)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.floor(1000 + Math.random() * 9000);
    const order_id = `HOS-${dateStr}-${randStr}`;
    const nowIso = new Date().toISOString();

    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (
        id, customer_id, customer_name, customer_email, customer_phone, customer_address,
        items, subtotal, shipping_fee, discount, total_amount, payment_method,
        payment_proof_url, payment_status, order_status, notes, admin_notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrderStmt.run(
      order_id,
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      JSON.stringify(items),
      subtotal,
      Number(shipping_fee),
      Number(discount),
      total_amount,
      payment_method,
      null, // payment_proof_url initially null until customer uploads
      'menunggu_pembayaran',
      'pending',
      notes || '',
      '',
      nowIso,
      nowIso
    );

    res.status(201).json({
      success: true,
      order_id,
      total_amount,
      message: 'Pesanan berhasil dibuat. Silakan lakukan pembayaran dan unggah bukti transfer.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat pesanan', details: String(error) });
  }
});

// Get all orders
apiRouter.get('/orders', (req: Request, res: Response) => {
  try {
    const { status, payment_status, search, customer_email } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: (string | number)[] = [];

    if (status && status !== 'semua') {
      query += ' AND order_status = ?';
      params.push(String(status));
    }

    if (payment_status && payment_status !== 'semua') {
      query += ' AND payment_status = ?';
      params.push(String(payment_status));
    }

    if (customer_email) {
      query += ' AND customer_email = ?';
      params.push(String(customer_email));
    }

    if (search) {
      query += ' AND (id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const rows = (db.prepare(query).all(...params) as any[]).map((o) => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
    }));

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', details: String(error) });
  }
});

// Get single order
apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
    if (!row) {
      return res.status(404).json({ error: 'Order not found' });
    }
    row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order', details: String(error) });
  }
});

// Customer Upload Payment Proof
apiRouter.post('/orders/:id/upload-proof', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { proof_image, notes } = req.body;

    if (!proof_image) {
      return res.status(400).json({ error: 'Bukti pembayaran (gambar) harus dilampirkan' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE orders SET
        payment_proof_url = ?,
        payment_status = 'menunggu_verifikasi',
        notes = CASE WHEN ? != '' THEN ? ELSE notes END,
        updated_at = ?
      WHERE id = ?
    `).run(proof_image, notes || '', notes || '', nowIso, id);

    res.json({
      success: true,
      message: 'Bukti pembayaran berhasil diunggah! Tim House of Septia akan segera memverifikasi.',
      payment_status: 'menunggu_verifikasi'
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengunggah bukti pembayaran', details: String(error) });
  }
});

// Admin Approval Payment Proof
apiRouter.put('/orders/:id/payment-approval', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body; // status: 'lunas' or 'ditolak'

    if (!['lunas', 'ditolak'].includes(status)) {
      return res.status(400).json({ error: 'Status persetujuan harus "lunas" atau "ditolak"' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    const nowIso = new Date().toISOString();
    // If approved, order status moves to 'diproses' if it was pending
    const nextOrderStatus = status === 'lunas' && order.order_status === 'pending' ? 'diproses' : order.order_status;

    db.prepare(`
      UPDATE orders SET
        payment_status = ?,
        order_status = ?,
        admin_notes = ?,
        updated_at = ?
      WHERE id = ?
    `).run(status, nextOrderStatus, admin_notes || '', nowIso, id);

    res.json({
      success: true,
      message: status === 'lunas' ? 'Pembayaran berhasil disetujui (Lunas)' : 'Pembayaran ditolak',
      payment_status: status,
      order_status: nextOrderStatus
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui status verifikasi pembayaran', details: String(error) });
  }
});

// Admin Update Order Status (diproses, dikirim, selesai, dibatalkan)
apiRouter.put('/orders/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { order_status, admin_notes } = req.body;

    const allowed = ['pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan'];
    if (!allowed.includes(order_status)) {
      return res.status(400).json({ error: 'Status pesanan tidak valid' });
    }

    const nowIso = new Date().toISOString();
    db.prepare(`
      UPDATE orders SET
        order_status = ?,
        admin_notes = COALESCE(?, admin_notes),
        updated_at = ?
      WHERE id = ?
    `).run(order_status, admin_notes ?? null, nowIso, id);

    res.json({ success: true, message: `Status pesanan diubah menjadi "${order_status}"` });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengubah status pesanan', details: String(error) });
  }
});

// ==================== CUSTOMERS ====================

apiRouter.get('/customers', (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params: string[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY total_spent DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers', details: String(error) });
  }
});

// ==================== REPORTS & ANALYTICS ====================

apiRouter.get('/reports/sales', (_req: Request, res: Response) => {
  try {
    // Total revenue from 'lunas' orders
    const revRow = db.prepare(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COALESCE(COUNT(*), 0) as paidOrdersCount
      FROM orders 
      WHERE payment_status = 'lunas'
    `).get() as any;

    // All orders stats
    const allOrdersRow = db.prepare(`
      SELECT COUNT(*) as totalOrdersCount FROM orders
    `).get() as any;

    // Total registered customers
    const custCount = db.prepare(`
      SELECT COUNT(*) as totalCustomers FROM customers
    `).get() as any;

    // Pending payment approvals count
    const pendingApprovalRow = db.prepare(`
      SELECT COUNT(*) as pendingApprovals FROM orders WHERE payment_status = 'menunggu_verifikasi'
    `).get() as any;

    // Total products & low stock count
    const productsCount = db.prepare(`
      SELECT COUNT(*) as totalProducts, SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) as lowStockCount FROM products
    `).get() as any;

    // Breakdown by payment status
    const paymentStatusBreakdown = db.prepare(`
      SELECT payment_status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as sum_amount 
      FROM orders GROUP BY payment_status
    `).all();

    // Breakdown by order status
    const orderStatusBreakdown = db.prepare(`
      SELECT order_status, COUNT(*) as count 
      FROM orders GROUP BY order_status
    `).all();

    // Extract product category sales and top selling products from items
    const allOrders = db.prepare('SELECT items, payment_status, created_at, total_amount FROM orders').all() as any[];

    const categoryStats: Record<string, { revenue: number; itemsSold: number }> = {
      'Dress & Kebaya Modern': { revenue: 0, itemsSold: 0 },
      'Atasan & Blouse Chic': { revenue: 0, itemsSold: 0 },
      'Bawahan & Rok Kasual': { revenue: 0, itemsSold: 0 },
    };

    const productSalesMap: Record<string, { id: string; name: string; qty: number; revenue: number }> = {};

    let totalItemsSold = 0;

    for (const order of allOrders) {
      if (order.payment_status === 'lunas' || order.payment_status === 'menunggu_verifikasi') {
        try {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          for (const it of items) {
            totalItemsSold += it.quantity || 1;
            // Product map
            if (!productSalesMap[it.id]) {
              productSalesMap[it.id] = { id: it.id, name: it.name, qty: 0, revenue: 0 };
            }
            productSalesMap[it.id].qty += it.quantity;
            productSalesMap[it.id].revenue += it.price * it.quantity;

            // Find category from db or guess
            const prodRow = db.prepare('SELECT category FROM products WHERE id = ?').get(it.id) as any;
            const cat = prodRow?.category || 'Dress & Kebaya Modern';
            if (!categoryStats[cat]) {
              categoryStats[cat] = { revenue: 0, itemsSold: 0 };
            }
            categoryStats[cat].revenue += it.price * it.quantity;
            categoryStats[cat].itemsSold += it.quantity;
          }
        } catch (e) {
          console.error('Error parsing order items in report:', e);
        }
      }
    }

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    res.json({
      totalRevenue: revRow.totalRevenue,
      paidOrdersCount: revRow.paidOrdersCount,
      totalOrdersCount: allOrdersRow.totalOrdersCount,
      totalCustomers: custCount.totalCustomers,
      pendingApprovals: pendingApprovalRow.pendingApprovals,
      totalProducts: productsCount.totalProducts,
      lowStockCount: productsCount.lowStockCount || 0,
      totalItemsSold,
      averageOrderValue: revRow.paidOrdersCount > 0 ? Math.round(revRow.totalRevenue / revRow.paidOrdersCount) : 0,
      categoryStats,
      topSellingProducts,
      paymentStatusBreakdown,
      orderStatusBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sales report', details: String(error) });
  }
});

// ==================== ADMIN AUTH ====================

apiRouter.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username/Email dan kata sandi wajib diisi' });
    }

    const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any;
    if (!admin || admin.password_hash !== password) {
      return res.status(401).json({ error: 'Kredensial login admin tidak sesuai. Silakan periksa kembali.' });
    }

    // Update last login
    db.prepare('UPDATE admin_users SET last_login = ? WHERE id = ?').run(new Date().toISOString(), admin.id);

    res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        last_login: new Date().toISOString()
      },
      token: 'hos_admin_session_' + Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: 'Login error', details: String(error) });
  }
});

// Reset Demo Data
apiRouter.post('/reset-demo', (_req: Request, res: Response) => {
  try {
    seedInitialData();
    res.json({ success: true, message: 'Database telah direset ke 12 produk awal dan sample data.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset demo data', details: String(error) });
  }
});
