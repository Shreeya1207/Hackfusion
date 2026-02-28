// Patch seed — adds missing medicine + all customers
// Run AFTER fixing Firestore rules: node patch-seed.js
const { db } = require('./firebase');

async function patch() {
    console.log('🩹 Patch seeding...\n');

    // Add the one missed medicine
    const ref = await db.collection('medicines').add({
        name: 'Ciprofloxacin 500mg', generic_name: 'Ciprofloxacin',
        dosage: '500mg', category: 'Antibiotic',
        price: 1.50, stock: 80, min_stock: 20, unit: 'pill',
        created_at: new Date().toISOString()
    });
    console.log(`✅ Ciprofloxacin 500mg → ${ref.id}`);

    // Seed customers
    const today = new Date().toISOString().split('T')[0];
    const customers = [
        { name: 'Sarah Collins', phone: '555-0101', email: 'sarah.collins@email.com', allergies: 'None', age: '34', gender: 'Female' },
        { name: 'John Doe', phone: '555-0102', email: 'john.doe@email.com', allergies: 'Penicillin', age: '45', gender: 'Male' },
        { name: 'Emily Carter', phone: '555-0103', email: 'emily.carter@email.com', allergies: 'Sulfa drugs', age: '28', gender: 'Female' },
        { name: 'Michael Brown', phone: '555-0104', email: 'michael.brown@email.com', allergies: 'Aspirin', age: '52', gender: 'Male' },
        { name: 'Linda Martinez', phone: '555-0105', email: 'linda.m@email.com', allergies: 'None', age: '39', gender: 'Female' },
        { name: 'David Wilson', phone: '555-0106', email: 'david.w@email.com', allergies: 'Codeine', age: '61', gender: 'Male' },
    ];

    console.log('\n👥 Seeding customers...');
    for (const c of customers) {
        const r = await db.collection('customers').add({ ...c, last_visit: today, created_at: new Date().toISOString() });
        console.log(`  ✅ ${c.name} → ${r.id}`);
    }

    console.log('\n🎉 Patch complete! Run: node server.js');
    process.exit(0);
}

patch().catch(err => { console.error('❌', err.message); process.exit(1); });
