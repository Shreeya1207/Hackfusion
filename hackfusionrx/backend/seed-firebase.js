const { db } = require('./firebase');
const firebase = require('firebase/compat/app');

// One-time seed script — run with: node seed-firebase.js
// Populates medicines + sample customers into Firestore

const medicines = [
    { name: 'Amoxicillin 250mg', generic_name: 'Amoxicillin', dosage: '250mg', category: 'Antibiotic', price: 0.85, stock: 120, min_stock: 30, unit: 'pill' },
    { name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin', dosage: '500mg', category: 'Antibiotic', price: 1.20, stock: 500, min_stock: 30, unit: 'pill' },
    { name: 'Ibuprofen 400mg', generic_name: 'Ibuprofen', dosage: '400mg', category: 'NSAID', price: 0.30, stock: 200, min_stock: 50, unit: 'pill' },
    { name: 'Ibuprofen 200mg', generic_name: 'Ibuprofen', dosage: '200mg', category: 'NSAID', price: 0.20, stock: 180, min_stock: 50, unit: 'pill' },
    { name: 'Paracetamol 500mg', generic_name: 'Paracetamol', dosage: '500mg', category: 'Analgesic', price: 0.25, stock: 150, min_stock: 50, unit: 'pill' },
    { name: 'Paracetamol 1000mg', generic_name: 'Paracetamol', dosage: '1000mg', category: 'Analgesic', price: 0.40, stock: 80, min_stock: 30, unit: 'pill' },
    { name: 'Azithromycin 500mg', generic_name: 'Azithromycin', dosage: '500mg', category: 'Antibiotic', price: 2.50, stock: 300, min_stock: 20, unit: 'pill' },
    { name: 'Metformin 500mg', generic_name: 'Metformin', dosage: '500mg', category: 'Antidiabetic', price: 0.40, stock: 100, min_stock: 40, unit: 'pill' },
    { name: 'Metformin 1000mg', generic_name: 'Metformin', dosage: '1000mg', category: 'Antidiabetic', price: 0.70, stock: 60, min_stock: 30, unit: 'pill' },
    { name: 'Lisinopril 10mg', generic_name: 'Lisinopril', dosage: '10mg', category: 'ACE Inhibitor', price: 0.60, stock: 80, min_stock: 30, unit: 'pill' },
    { name: 'Lisinopril 5mg', generic_name: 'Lisinopril', dosage: '5mg', category: 'ACE Inhibitor', price: 0.45, stock: 40, min_stock: 20, unit: 'pill' },
    { name: 'Cetirizine 10mg', generic_name: 'Cetirizine', dosage: '10mg', category: 'Antihistamine', price: 0.35, stock: 90, min_stock: 30, unit: 'pill' },
    { name: 'Omeprazole 20mg', generic_name: 'Omeprazole', dosage: '20mg', category: 'Antacid', price: 0.50, stock: 70, min_stock: 30, unit: 'pill' },
    { name: 'Atorvastatin 10mg', generic_name: 'Atorvastatin', dosage: '10mg', category: 'Statin', price: 0.80, stock: 55, min_stock: 25, unit: 'pill' },
    { name: 'Ciprofloxacin 500mg', generic_name: 'Ciprofloxacin', dosage: '500mg', category: 'Antibiotic', price: 1.50, stock: 80, min_stock: 20, unit: 'pill' },
];

const today = new Date().toISOString().split('T')[0];
const customers = [
    { name: 'Sarah Collins', phone: '555-0101', email: 'sarah.collins@email.com', allergies: 'None', age: '34', gender: 'Female', last_visit: today },
    { name: 'John Doe', phone: '555-0102', email: 'john.doe@email.com', allergies: 'Penicillin', age: '45', gender: 'Male', last_visit: today },
    { name: 'Emily Carter', phone: '555-0103', email: 'emily.carter@email.com', allergies: 'Sulfa drugs', age: '28', gender: 'Female', last_visit: today },
    { name: 'Michael Brown', phone: '555-0104', email: 'michael.brown@email.com', allergies: 'Aspirin', age: '52', gender: 'Male', last_visit: today },
    { name: 'Linda Martinez', phone: '555-0105', email: 'linda.m@email.com', allergies: 'None', age: '39', gender: 'Female', last_visit: today },
    { name: 'David Wilson', phone: '555-0106', email: 'david.w@email.com', allergies: 'Codeine', age: '61', gender: 'Male', last_visit: today },
];

async function seed() {
    console.log('🌱 Seeding Firestore...\n');

    // Seed medicines
    console.log('💊 Seeding medicines...');
    for (const med of medicines) {
        const ref = await db.collection('medicines').add({ ...med, created_at: new Date().toISOString() });
        console.log(`  ✅ ${med.name} → ${ref.id}`);
    }

    // Seed customers
    console.log('\n👥 Seeding customers...');
    for (const cust of customers) {
        const ref = await db.collection('customers').add({ ...cust, created_at: new Date().toISOString() });
        console.log(`  ✅ ${cust.name} → ${ref.id}`);
    }

    console.log('\n🎉 Firestore seeded successfully!');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
