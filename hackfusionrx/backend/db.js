const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'pharmacy.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ─── Create Tables ─────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    allergies TEXT DEFAULT 'None',
    last_visit TEXT,
    phone TEXT,
    email TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    generic_name TEXT,
    dosage TEXT,
    category TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER DEFAULT 20,
    unit TEXT DEFAULT 'pill',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS purchase_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    customer_name TEXT NOT NULL,
    medicine_id INTEGER,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    quantity INTEGER NOT NULL,
    price_per_unit REAL NOT NULL,
    total_price REAL NOT NULL,
    order_date TEXT NOT NULL,
    order_time TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(id)
  );
`);

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();
if (customerCount.count === 0) {
    const insertCustomer = db.prepare(`
    INSERT INTO customers (name, allergies, last_visit, phone, email) 
    VALUES (?, ?, ?, ?, ?)
  `);

    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
    const oneMonthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

    insertCustomer.run('Sarah Collins', 'None', twoWeeksAgo, '555-0101', 'sarah.collins@email.com');
    insertCustomer.run('John Doe', 'Penicillin', oneMonthAgo, '555-0102', 'john.doe@email.com');
    insertCustomer.run('Emily Carter', 'Sulfa drugs', oneWeekAgo, '555-0103', 'emily.carter@email.com');
    insertCustomer.run('Michael Brown', 'Aspirin', threeDaysAgo, '555-0104', 'michael.brown@email.com');
    insertCustomer.run('Linda Martinez', 'None', oneMonthAgo, '555-0105', 'linda.m@email.com');
    insertCustomer.run('David Wilson', 'Codeine', twoWeeksAgo, '555-0106', 'david.w@email.com');

    console.log('✅ Customers seeded');
}

const medicineCount = db.prepare('SELECT COUNT(*) as count FROM medicines').get();
if (medicineCount.count === 0) {
    const insertMed = db.prepare(`
    INSERT INTO medicines (name, generic_name, dosage, category, price, stock, min_stock, unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertMed.run('Amoxicillin 250mg', 'Amoxicillin', '250mg', 'Antibiotic', 0.85, 12, 30, 'pill');
    insertMed.run('Amoxicillin 500mg', 'Amoxicillin', '500mg', 'Antibiotic', 1.20, 50, 30, 'pill');
    insertMed.run('Ibuprofen 400mg', 'Ibuprofen', '400mg', 'NSAID', 0.30, 200, 50, 'pill');
    insertMed.run('Ibuprofen 200mg', 'Ibuprofen', '200mg', 'NSAID', 0.20, 180, 50, 'pill');
    insertMed.run('Paracetamol 500mg', 'Paracetamol', '500mg', 'Analgesic', 0.25, 150, 50, 'pill');
    insertMed.run('Paracetamol 1000mg', 'Paracetamol', '1000mg', 'Analgesic', 0.40, 80, 30, 'pill');
    insertMed.run('Azithromycin 500mg', 'Azithromycin', '500mg', 'Antibiotic', 2.50, 30, 20, 'pill');
    insertMed.run('Metformin 500mg', 'Metformin', '500mg', 'Antidiabetic', 0.40, 100, 40, 'pill');
    insertMed.run('Metformin 1000mg', 'Metformin', '1000mg', 'Antidiabetic', 0.70, 60, 30, 'pill');
    insertMed.run('Lisinopril 10mg', 'Lisinopril', '10mg', 'ACE Inhibitor', 0.60, 80, 30, 'pill');
    insertMed.run('Lisinopril 5mg', 'Lisinopril', '5mg', 'ACE Inhibitor', 0.45, 40, 20, 'pill');
    insertMed.run('Cetirizine 10mg', 'Cetirizine', '10mg', 'Antihistamine', 0.35, 90, 30, 'pill');
    insertMed.run('Omeprazole 20mg', 'Omeprazole', '20mg', 'Antacid', 0.50, 70, 30, 'pill');
    insertMed.run('Atorvastatin 10mg', 'Atorvastatin', '10mg', 'Statin', 0.80, 55, 25, 'pill');
    insertMed.run('Ciprofloxacin 500mg', 'Ciprofloxacin', '500mg', 'Antibiotic', 1.50, 8, 20, 'pill');

    console.log('✅ Medicines seeded');
}

module.exports = db;
