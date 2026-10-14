import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'house_of_septia.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for high reliability
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  console.warn('SQLite PRAGMA setup warning:', e);
}

export function initDatabase() {
  // 1. Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      sizes TEXT NOT NULL,
      colors TEXT NOT NULL,
      material TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 2. Customers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      total_orders INTEGER DEFAULT 0,
      total_spent INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // 3. Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      shipping_fee INTEGER NOT NULL,
      discount INTEGER NOT NULL DEFAULT 0,
      total_amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      payment_proof_url TEXT,
      payment_status TEXT NOT NULL,
      order_status TEXT NOT NULL,
      notes TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 4. Admin Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      last_login TEXT
    );
  `);

  // Seed default admin if not exists
  const checkAdmin = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (checkAdmin.count === 0) {
    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (id, username, password_hash, name, role, last_login)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertAdmin.run(
      'admin-1',
      'admin@houseofseptia.com',
      'admin123',
      'Septia Aryani (Owner)',
      'Super Admin',
      new Date().toISOString()
    );
  }

  // Seed initial 12 products across 3 women's fashion categories if table is empty
  const checkProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (checkProducts.count === 0) {
    seedInitialData();
  }

  // Ensure Adelia Plisse A-Line Skirt uses the high-definition model photo
  db.prepare(`UPDATE products SET image_url = ? WHERE id = 'hos-prod-11'`).run('/adelia-plisse-skirt.jpg');
}

export function seedInitialData() {
  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products (id, name, category, price, stock, description, image_url, sizes, colors, material, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialProducts = [
    // --- Kategori 1: Dress & Kebaya Modern (4 Produk) ---
    {
      id: 'hos-prod-01',
      name: 'Aurelia Brocade Silk Dress',
      category: 'Dress & Kebaya Modern',
      price: 489000,
      stock: 18,
      description: 'Gaun brokat modern dengan sentuhan sutra jacquard mewah, kerah cheongsam-shanghai anggun, serta furing katun silky adem. Sangat memukau untuk pesta, wisuda, atau kondangan formal.',
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Sage Green', 'Rose Gold', 'Oatmeal']),
      material: 'Brocade Jacquard Silk & Satin Inner',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
    },
    {
      id: 'hos-prod-02',
      name: 'Septia Signature Organza Kebaya Set',
      category: 'Dress & Kebaya Modern',
      price: 575000,
      stock: 12,
      description: 'Set kebaya kurung berbahan organza embroidery premium dengan detail payet handmade di kerah dan manset, dilengkapi inner silk bertekstur dan rok lilit songket motif eksklusif House of Septia.',
      image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Soft Terracotta', 'Champagne', 'Lilac Breeze']),
      material: 'Premium Embroidered Organza + Inner Silk',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
    },
    {
      id: 'hos-prod-03',
      name: 'Kallista Satin Pleated Maxi Dress',
      category: 'Dress & Kebaya Modern',
      price: 420000,
      stock: 24,
      description: 'Maxi dress berpotongan empire waist dengan detail plisket halus yang jatuh anggun. Dilengkapi tali pita pinggang adjustable untuk siluet tubuh yang semampai dan feminin.',
      image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S', 'M', 'L']),
      colors: JSON.stringify(['Emerald Green', 'Dusty Pink', 'Mocha Brown']),
      material: 'Korean Heavy Satin Silky',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
    },
    {
      id: 'hos-prod-04',
      name: 'Diva Embroidered Silk Kaftan',
      category: 'Dress & Kebaya Modern',
      price: 510000,
      stock: 15,
      description: 'Kaftan siluet flowy dengan bordir floral handmade di sepanjang garis leher V-neck dan lengan dolman. Tampilan mewah dan bebas gerak sepanjang perayaan hari istimewa.',
      image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['All Size (Fit to XL)']),
      colors: JSON.stringify(['Pearl White', 'Midnight Navy', 'Warm Taupe']),
      material: 'Pure Silk Crepe',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
    },

    // --- Kategori 2: Atasan & Blouse Chic (4 Produk) ---
    {
      id: 'hos-prod-05',
      name: 'Celine Puff Sleeve Linen Blouse',
      category: 'Atasan & Blouse Chic',
      price: 265000,
      stock: 30,
      description: 'Blus lengan lonceng berkerut lembut dengan material linen rami berserat alami yang sangat sejuk di iklim tropis. Aksen kancing batok kelapa estetik di bagian depan.',
      image_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Almond Cream', 'Olive Green', 'Terracotta']),
      material: '100% Breathable Eco-Linen',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
    },
    {
      id: 'hos-prod-06',
      name: 'Rania Lace Collar Poplin Shirt',
      category: 'Atasan & Blouse Chic',
      price: 295000,
      stock: 22,
      description: 'Kemeja siluet semi-loose dengan detail statement collar berenda vintage broderie anglaise. Sangat modis dipadukan dengan celana kulot maupun rok span.',
      image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S', 'M', 'L']),
      colors: JSON.stringify(['Pure Ivory', 'Sky Pastel', 'Soft Blush']),
      material: 'Premium Cotton Poplin 50s',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
    },
    {
      id: 'hos-prod-07',
      name: 'Zulfa Casual Blouse',
      category: 'Atasan & Blouse Chic',
      price: 245000,
      stock: 28,
      description: 'Blouse casual berpotongan santai dan feminin dengan bahan katun lembut yang sejuk dan nyaman dipakai sepanjang hari. Cocok dipadukan dengan celana kulot maupun rok untuk gaya kasual sehari-hari.',
      image_url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Latte Beige', 'Terracotta Sand', 'Warm Taupe']),
      material: 'Katun Lembut Casual (Breathable Cotton)',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
    },
    {
      id: 'hos-prod-08',
      name: 'Nathania Knit Ribbon Cardigan',
      category: 'Atasan & Blouse Chic',
      price: 310000,
      stock: 20,
      description: 'Cardigan rajut halus beraksen pita manis di bagian bukaan depan. Tekstur knit berongga lembut cocok dipakai sebagai outerwear stylish di kantor ber-AC atau kafe.',
      image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S/M', 'L/XL']),
      colors: JSON.stringify(['Butter Yellow', 'Powder Pink', 'Cloud Grey']),
      material: 'Fine Gauge Cotton Wool Blend',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },

    // --- Kategori 3: Bawahan & Rok Kasual (4 Produk) ---
    {
      id: 'hos-prod-09',
      name: 'Eleanor High-Waist Culottes',
      category: 'Bawahan & Rok Kasual',
      price: 280000,
      stock: 25,
      description: 'Celana kulot berpinggang tinggi dengan aksen lipit depan (front pleats) dan saku samping fungsional. Potongan lurus santai memberi siluet kaki jenjang dan chic.',
      image_url: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Camel Brown', 'Warm Sand', 'Onyx Black']),
      material: 'Semi-Wool Suit Fabric',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
      id: 'hos-prod-10',
      name: 'Mireille Mermaid Tiered Skirt',
      category: 'Bawahan & Rok Kasual',
      price: 325000,
      stock: 16,
      description: 'Rok duyung bertingkat dengan detail ruffle feminin di bagian keliman bawah. Karet pinggang belakang elastis memberikan kenyamanan ekstra seharian.',
      image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S/M', 'L/XL']),
      colors: JSON.stringify(['Dusty Rose', 'Olive Khaki', 'Broken White']),
      material: 'Textured Crinkle Crepe',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
    },
    {
      id: 'hos-prod-11',
      name: 'Adelia Plisse A-Line Skirt',
      category: 'Bawahan & Rok Kasual',
      price: 270000,
      stock: 32,
      description: 'Rok plisket A-line flowy dengan lipatan mikro presisi yang tidak mudah pudar walau dicuci berkali-kali. Nyaman dan anggun untuk tampilan kasual hingga semi-formal.',
      image_url: '/adelia-plisse-skirt.jpg',
      sizes: JSON.stringify(['All Size (Fit S to XXL)']),
      colors: JSON.stringify(['Sage Tint', 'Champagne Gold', 'Classic Navy']),
      material: 'Silky Chiffon Plisse + Furing Hyget',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
    },
    {
      id: 'hos-prod-12',
      name: 'Bianca Tailored Wide-Leg Trousers',
      category: 'Bawahan & Rok Kasual',
      price: 335000,
      stock: 19,
      description: 'Celana palazzo tailoring modern dengan waistband kokoh dan kaitan besi tersembunyi. Jatuh kain berbobot mantap, cocok untuk ke kantor atau hangout santai.',
      image_url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&auto=format&fit=crop&q=80',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Espresso', 'Steel Blue', 'Soft Cream']),
      material: 'Premium Cotton Twill Suiting',
      created_at: new Date().toISOString()
    }
  ];

  for (const p of initialProducts) {
    insertProduct.run(
      p.id,
      p.name,
      p.category,
      p.price,
      p.stock,
      p.description,
      p.image_url,
      p.sizes,
      p.colors,
      p.material,
      p.created_at
    );
  }

  // Seed sample customers
  const insertCustomer = db.prepare(`
    INSERT OR REPLACE INTO customers (id, name, email, phone, address, city, postal_code, total_orders, total_spent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleCustomers = [
    {
      id: 'cust-01',
      name: 'Amanda Putri Lestari',
      email: 'amanda.putri@gmail.com',
      phone: '081289123456',
      address: 'Jl. Senopati Raya No. 42, Kebayoran Baru',
      city: 'Jakarta Selatan',
      postal_code: '12190',
      total_orders: 2,
      total_spent: 1064000,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
    },
    {
      id: 'cust-02',
      name: 'Dinda Kirana',
      email: 'dinda.kirana@yahoo.com',
      phone: '081377889900',
      address: 'Cluster Menteng Indah Blok B3 No. 12',
      city: 'Bandung',
      postal_code: '40135',
      total_orders: 1,
      total_spent: 575000,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
    },
    {
      id: 'cust-03',
      name: 'Nadia Salsabila',
      email: 'nadia.salsa@outlook.com',
      phone: '085712348877',
      address: 'Jl. Raya Darmo Permai Selatan No. 8',
      city: 'Surabaya',
      postal_code: '60189',
      total_orders: 1,
      total_spent: 605000,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    }
  ];

  for (const c of sampleCustomers) {
    insertCustomer.run(
      c.id,
      c.name,
      c.email,
      c.phone,
      c.address,
      c.city,
      c.postal_code,
      c.total_orders,
      c.total_spent,
      c.created_at
    );
  }

  // Seed sample orders (including one awaiting payment verification with sample transfer proof!)
  const insertOrder = db.prepare(`
    INSERT OR REPLACE INTO orders (
      id, customer_id, customer_name, customer_email, customer_phone, customer_address,
      items, subtotal, shipping_fee, discount, total_amount, payment_method,
      payment_proof_url, payment_status, order_status, notes, admin_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleOrders = [
    {
      id: 'HOS-20261011-0082',
      customer_id: 'cust-01',
      customer_name: 'Amanda Putri Lestari',
      customer_email: 'amanda.putri@gmail.com',
      customer_phone: '081289123456',
      customer_address: 'Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan',
      items: JSON.stringify([
        {
          id: 'hos-prod-01',
          name: 'Aurelia Brocade Silk Dress',
          price: 489000,
          quantity: 1,
          size: 'M',
          color: 'Sage Green',
          image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
        },
        {
          id: 'hos-prod-02',
          name: 'Septia Signature Organza Kebaya Set',
          price: 575000,
          quantity: 1,
          size: 'M',
          color: 'Soft Terracotta',
          image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'
        }
      ]),
      subtotal: 1064000,
      shipping_fee: 0,
      discount: 0,
      total_amount: 1064000,
      payment_method: 'Transfer Bank BCA',
      payment_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      payment_status: 'lunas',
      order_status: 'dikirim',
      notes: 'Mohon dibungkus box kado ya kak',
      admin_notes: 'Pembayaran BCA an Amanda Putri terverifikasi mutasi rek.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
    },
    {
      id: 'HOS-20261012-0104',
      customer_id: 'cust-02',
      customer_name: 'Dinda Kirana',
      customer_email: 'dinda.kirana@yahoo.com',
      customer_phone: '081377889900',
      customer_address: 'Cluster Menteng Indah Blok B3 No. 12, Bandung',
      items: JSON.stringify([
        {
          id: 'hos-prod-02',
          name: 'Septia Signature Organza Kebaya Set',
          price: 575000,
          quantity: 1,
          size: 'S',
          color: 'Champagne',
          image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'
        }
      ]),
      subtotal: 575000,
      shipping_fee: 22000,
      discount: 22000,
      total_amount: 575000,
      payment_method: 'Transfer Bank Mandiri',
      payment_proof_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      payment_status: 'menunggu_verifikasi',
      order_status: 'pending',
      notes: 'Transfer via Livin Mandiri jam 14:20',
      admin_notes: '',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString()
    },
    {
      id: 'HOS-20261013-0118',
      customer_id: 'cust-03',
      customer_name: 'Nadia Salsabila',
      customer_email: 'nadia.salsa@outlook.com',
      customer_phone: '085712348877',
      customer_address: 'Jl. Raya Darmo Permai Selatan No. 8, Surabaya',
      items: JSON.stringify([
        {
          id: 'hos-prod-05',
          name: 'Celine Puff Sleeve Linen Blouse',
          price: 265000,
          quantity: 1,
          size: 'M',
          color: 'Almond Cream',
          image_url: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&auto=format&fit=crop&q=80'
        },
        {
          id: 'hos-prod-12',
          name: 'Bianca Tailored Wide-Leg Trousers',
          price: 335000,
          quantity: 1,
          size: 'M',
          color: 'Soft Cream',
          image_url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&auto=format&fit=crop&q=80'
        }
      ]),
      subtotal: 600000,
      shipping_fee: 25000,
      discount: 20000,
      total_amount: 605000,
      payment_method: 'QRIS Realtime',
      payment_proof_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80',
      payment_status: 'menunggu_verifikasi',
      order_status: 'pending',
      notes: 'Pembayaran QRIS scan barcode',
      admin_notes: '',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    }
  ];

  for (const o of sampleOrders) {
    insertOrder.run(
      o.id,
      o.customer_id,
      o.customer_name,
      o.customer_email,
      o.customer_phone,
      o.customer_address,
      o.items,
      o.subtotal,
      o.shipping_fee,
      o.discount,
      o.total_amount,
      o.payment_method,
      o.payment_proof_url,
      o.payment_status,
      o.order_status,
      o.notes,
      o.admin_notes,
      o.created_at,
      o.updated_at
    );
  }
}

// Initialize on module load
initDatabase();
