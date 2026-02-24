const express = require('express');
const cors = require('cors');
const db = require('./db');
const { extractPrescription, checkOllamaHealth } = require('./ollama');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Helper: Find customer by name (fuzzy match) ───────────────────────────────
function findCustomer(name) {
    if (!name) return null;
    const all = db.prepare('SELECT * FROM customers').all();
    const nameLower = name.toLowerCase().trim();

    let match = all.find(c => c.name.toLowerCase() === nameLower);
    if (match) return match;

    match = all.find(c => {
        const cParts = c.name.toLowerCase().split(' ');
        const nParts = nameLower.split(' ');
        return nParts.every(part => cParts.some(cp => cp.includes(part) || part.includes(cp)));
    });
    if (match) return match;

    const firstName = nameLower.split(' ')[0];
    return all.find(c => c.name.toLowerCase().startsWith(firstName)) || null;
}

// ─── Helper: Find medicine by name (fuzzy match) ──────────────────────────────
function findMedicine(name) {
    if (!name) return null;
    const all = db.prepare('SELECT * FROM medicines').all();
    const nameLower = name.toLowerCase().trim();

    let match = all.find(m => m.name.toLowerCase() === nameLower);
    if (match) return match;

    match = all.find(m => m.name.toLowerCase().includes(nameLower));
    if (match) return match;

    match = all.find(m => nameLower.includes(m.name.toLowerCase()));
    if (match) return match;

    const firstWord = nameLower.split(' ')[0];
    return all.find(m =>
        m.name.toLowerCase().startsWith(firstWord) ||
        (m.generic_name && m.generic_name.toLowerCase().startsWith(firstWord))
    ) || null;
}

// ─── ROUTE: Health check ───────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
    const ollamaHealth = await checkOllamaHealth();
    res.json({
        server: 'ok',
        ollama: ollamaHealth,
        database: 'ok',
        timestamp: new Date().toISOString()
    });
});

// ─── ROUTE: Extract prescription from NLP ─────────────────────────────────────
app.post('/api/extract-prescription', async (req, res) => {
    const { text } = req.body;

    if (!text || text.trim().length < 5) {
        return res.status(400).json({ success: false, error: 'Input text is too short' });
    }

    try {
        const extracted = await extractPrescription(text);
        console.log('📋 Extracted:', JSON.stringify(extracted, null, 2));

        // Find customer
        const customer = findCustomer(extracted.patient_name);
        if (customer) {
            const now = new Date();
            db.prepare('UPDATE customers SET last_visit = ? WHERE id = ?')
                .run(now.toISOString().split('T')[0], customer.id);
            customer.last_visit = now.toISOString().split('T')[0];
        }

        // Process each medicine individually
        const medicinesList = (extracted.medicines || []).map(med => {
            const medicine = findMedicine(med.medicine_name);
            const quantity = med.quantity || (med.frequency_per_day * med.days) || 0;
            const stockStatus = medicine ? {
                available: medicine.stock,
                required: quantity,
                shortage: Math.max(0, quantity - medicine.stock),
                sufficient: medicine.stock >= quantity
            } : null;

            return {
                ...med,
                quantity,
                medicine,
                stock_status: stockStatus,
                unit_price: medicine ? medicine.price : null,
                total_price: medicine ? (medicine.price * quantity).toFixed(2) : null,
            };
        });

        const now = new Date();
        const grandTotal = medicinesList
            .reduce((sum, m) => sum + (parseFloat(m.total_price) || 0), 0)
            .toFixed(2);

        res.json({
            success: true,
            data: {
                patient_name: extracted.patient_name,
                medicines: medicinesList,
                customer,
                order_date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                order_time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                grand_total: grandTotal
            }
        });

    } catch (err) {
        console.error('❌ Extraction error:', err.message);
        if (err.message.includes('fetch') || err.message.includes('ECONNREFUSED')) {
            return res.status(503).json({
                success: false,
                error: 'Ollama is not running. Please start it with: ollama serve'
            });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── ROUTE: Create order ───────────────────────────────────────────────────────
app.post('/api/create-order', (req, res) => {
    const {
        customer_id, customer_name,
        medicine_id, medicine_name,
        dosage, quantity, price_per_unit, notes
    } = req.body;

    if (!customer_name || !medicine_name || !quantity || !price_per_unit) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const now = new Date();
        const total_price = (price_per_unit * quantity).toFixed(2);
        const order_date = now.toISOString().split('T')[0];
        const order_time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const insert = db.prepare(`
      INSERT INTO purchase_history 
        (customer_id, customer_name, medicine_id, medicine_name, dosage, 
         quantity, price_per_unit, total_price, order_date, order_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = insert.run(
            customer_id || null, customer_name,
            medicine_id || null, medicine_name,
            dosage || '', quantity, price_per_unit,
            total_price, order_date, order_time,
            notes || ''
        );

        if (medicine_id) {
            db.prepare('UPDATE medicines SET stock = MAX(0, stock - ?) WHERE id = ?')
                .run(quantity, medicine_id);
        }

        if (customer_id) {
            db.prepare('UPDATE customers SET last_visit = ? WHERE id = ?')
                .run(order_date, customer_id);
        }

        const updatedMedicine = medicine_id
            ? db.prepare('SELECT * FROM medicines WHERE id = ?').get(medicine_id)
            : null;

        console.log(`✅ Order #${result.lastInsertRowid} created: ${customer_name} - ${medicine_name} x${quantity}`);

        res.json({
            success: true,
            order_id: result.lastInsertRowid,
            total_price,
            order_date,
            order_time,
            updated_stock: updatedMedicine?.stock ?? null
        });

    } catch (err) {
        console.error('❌ Order creation error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── ROUTE: Get all customers ──────────────────────────────────────────────────
app.get('/api/customers', (req, res) => {
    const search = req.query.search || '';
    const customers = search
        ? db.prepare('SELECT * FROM customers WHERE name LIKE ? ORDER BY name').all(`%${search}%`)
        : db.prepare('SELECT * FROM customers ORDER BY name').all();
    res.json(customers);
});


// ─── ROUTE: Create new customer ───────────────────────────────────────────────
app.post("/api/customers", (req, res) => {
    const { name, phone, allergies, email, age, gender, last_visit } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: "Name is required" });
    }
    try {
        try { db.exec("ALTER TABLE customers ADD COLUMN age TEXT"); } catch (e) { }
        try { db.exec("ALTER TABLE customers ADD COLUMN gender TEXT"); } catch (e) { }
        const result = db.prepare("INSERT INTO customers (name, phone, allergies, email, last_visit, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
            name.trim(), (phone || "").trim(), allergies || "None", email || "",
            last_visit || new Date().toISOString().split("T")[0], age || "", gender || ""
        );
        const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(result.lastInsertRowid);
        console.log("New customer: " + name);
        res.json({ success: true, customer });
    } catch (err) {
        console.error("Customer error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── ROUTE: Get single customer ────────────────────────────────────────────────
app.get('/api/customers/:id', (req, res) => {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const history = db.prepare(
        'SELECT * FROM purchase_history WHERE customer_id = ? ORDER BY id DESC LIMIT 10'
    ).all(req.params.id);

    res.json({ ...customer, purchase_history: history });
});

// ─── ROUTE: Get all medicines ──────────────────────────────────────────────────
app.get('/api/medicines', (req, res) => {
    const medicines = db.prepare('SELECT * FROM medicines ORDER BY name').all();
    res.json(medicines);
});

// ─── ROUTE: Get alternatives ──────────────────────────────────────────────────
app.get('/api/alternatives/:medicineName', (req, res) => {
    const name = req.params.medicineName;
    const firstWord = name.split(' ')[0];
    const currentId = parseInt(req.query.exclude) || 0;

    const alternatives = db.prepare(`
    SELECT * FROM medicines 
    WHERE (name LIKE ? OR generic_name LIKE ?) 
      AND id != ?
      AND stock > 0
    ORDER BY stock DESC
  `).all(`%${firstWord}%`, `%${firstWord}%`, currentId);

    res.json(alternatives);
});

// ─── ROUTE: Get purchase history ──────────────────────────────────────────────
app.get('/api/purchase-history', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const history = db.prepare(
        'SELECT * FROM purchase_history ORDER BY id DESC LIMIT ?'
    ).all(limit);
    res.json(history);
});

// ─── ROUTE: Get dashboard stats ───────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM purchase_history').get();
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    const totalMedicines = db.prepare('SELECT COUNT(*) as count FROM medicines').get();
    const lowStockMeds = db.prepare('SELECT COUNT(*) as count FROM medicines WHERE stock < min_stock').get();
    const todayRevenue = db.prepare(
        "SELECT COALESCE(SUM(total_price),0) as revenue FROM purchase_history WHERE order_date = date('now')"
    ).get();

    res.json({
        total_orders: totalOrders.count,
        total_customers: totalCustomers.count,
        total_medicines: totalMedicines.count,
        low_stock_count: lowStockMeds.count,
        today_revenue: parseFloat(todayRevenue.revenue).toFixed(2)
    });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 HackfusionRX Backend running on http://localhost:${PORT}`);
    console.log(`📦 Database: pharmacy.db`);
    console.log(`🤖 Ollama model: ${process.env.OLLAMA_MODEL || 'llama3.2'}`);
    console.log(`🔗 Ollama URL: ${process.env.OLLAMA_URL || 'http://localhost:11434'}`);
    console.log(`\nAvailable routes:`);
    console.log(`  GET  /api/health`);
    console.log(`  POST /api/extract-prescription`);
    console.log(`  POST /api/create-order`);
    console.log(`  GET  /api/customers`);
    console.log(`  GET  /api/medicines`);
    console.log(`  GET  /api/purchase-history`);
    console.log(`  GET  /api/alternatives/:name`);
    console.log(`  GET  /api/stats\n`);
});