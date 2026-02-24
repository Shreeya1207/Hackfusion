# 💊 HackfusionRX — AI Pharmacy Assistant

A complete pharmacy management system with AI-powered prescription extraction using **Ollama (100% free, runs locally)**. No API keys needed.

---

## 🏗️ Architecture

```
Frontend (React + Vite)  ←→  Backend (Node.js + Express)  ←→  SQLite Database
         Port 5173                    Port 3001                  pharmacy.db
                                          ↕
                                  Ollama (Local AI)
                                     Port 11434
                                    Model: llama3.2
```

---

## 📁 Project Structure

```
hackfusionrx/
├── backend/
│   ├── server.js       ← Express API server (all routes)
│   ├── db.js           ← SQLite setup + seeded data
│   ├── ollama.js       ← Ollama AI integration
│   ├── package.json
│   └── pharmacy.db     ← Auto-created on first run
│
└── frontend/
    ├── src/
    │   ├── App.jsx     ← Complete React UI
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:** Download from https://ollama.ai/download

---

### Step 2 — Start Ollama & Pull Model

```bash
# Terminal 1: Start Ollama server
ollama serve

# Terminal 2: Pull the model (one-time, ~2GB download)
ollama pull llama3.2

# Verify it works
ollama run llama3.2 "Say hello"
```

> **Alternative models** (if llama3.2 is too slow on your machine):
> - `ollama pull llama3.2:1b` — Smaller, faster
> - `ollama pull phi3` — Very fast, good accuracy
> - `ollama pull mistral` — Good balance

---

### Step 3 — Setup Backend

```bash
cd hackfusionrx/backend
npm install
node server.js
```

You should see:
```
🚀 HackfusionRX Backend running on http://localhost:3001
📦 Database: pharmacy.db
🤖 Ollama model: llama3.2
✅ Customers seeded
✅ Medicines seeded
```

---

### Step 4 — Setup Frontend

```bash
# New terminal
cd hackfusionrx/frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## 🤖 How It Works

### Flow: Voice/Text → AI → Database → Order

```
1. Pharmacist types or speaks:
   "Patient Sarah Collins just called. She needs a refill for 
    her Amoxicillin 250mg, 1 pill 3 times a day for 7 days."

2. POST /api/extract-prescription
   → Sent to Ollama (llama3.2) for NLP extraction
   → Returns structured JSON:
     {
       "patient_name": "Sarah Collins",
       "medicine_name": "Amoxicillin 250mg",
       "dosage": "1 pill",
       "frequency": "3x day",
       "frequency_per_day": 3,
       "days": 7,
       "quantity": 21
     }

3. Database lookups (fuzzy matching):
   → Customer "Sarah Collins" found ✓
   → "Amoxicillin 250mg" found, stock: 12, price: $0.85 ✓
   → Stock check: 21 needed, 12 available → Shortage: 9

4. Frontend updates automatically:
   → Chat shows validated prescription card
   → Live Context panel shows customer info + stock badge
   → Alert: "Only 12 pills in stock. Shortage of 9 pills."

5. Pharmacist clicks "Create Order":
   → POST /api/create-order
   → Order saved to purchase_history table
   → Medicine stock reduced (12 → 0, capped at 0)
   → Customer last_visit updated to today
   → Success message shown
```

---

## 🗄️ Database Schema

### customers
| Field      | Type | Example              |
|-----------|------|----------------------|
| id        | INT  | 1                    |
| name      | TEXT | Sarah Collins        |
| allergies | TEXT | None                 |
| last_visit| TEXT | 2026-02-23           |
| phone     | TEXT | 555-0101             |
| email     | TEXT | sarah@email.com      |

### medicines
| Field      | Type | Example             |
|-----------|------|---------------------|
| id        | INT  | 1                   |
| name      | TEXT | Amoxicillin 250mg   |
| category  | TEXT | Antibiotic          |
| price     | REAL | 0.85                |
| stock     | INT  | 12                  |
| min_stock | INT  | 30 (low stock alert)|

### purchase_history
| Field         | Type | Example           |
|--------------|------|-------------------|
| id           | INT  | 1                 |
| customer_name| TEXT | Sarah Collins     |
| medicine_name| TEXT | Amoxicillin 250mg |
| quantity     | INT  | 21                |
| total_price  | REAL | 17.85             |
| order_date   | TEXT | 2026-02-23        |
| order_time   | TEXT | 02:30 PM          |
| status       | TEXT | completed         |

---

## 🔌 API Routes

| Method | Route                          | Description                        |
|--------|--------------------------------|------------------------------------|
| GET    | /api/health                    | Check server + Ollama status       |
| POST   | /api/extract-prescription      | NLP → structured prescription      |
| POST   | /api/create-order              | Save order, update stock           |
| GET    | /api/customers                 | List all customers                 |
| GET    | /api/customers/:id             | Single customer + history          |
| GET    | /api/medicines                 | Full inventory list                |
| GET    | /api/alternatives/:name        | Find alternative medicines         |
| GET    | /api/purchase-history          | All orders (newest first)          |
| GET    | /api/stats                     | Dashboard stats                    |

---

## 🎤 Voice Input

Voice uses the **Web Speech API** (built into Chrome/Edge — free):
- Click the 🎤 microphone button
- Speak naturally: *"Patient John Doe needs Ibuprofen 400mg twice a day for 5 days"*
- Transcript appears in input box automatically
- Sent to Ollama for extraction on completion

**Supported browsers:** Chrome, Edge (not Firefox/Safari)

---

## ⚙️ Configuration

Change Ollama model in backend:
```bash
# Use a different model
OLLAMA_MODEL=phi3 node server.js

# Or use a remote Ollama instance
OLLAMA_URL=http://192.168.1.100:11434 node server.js
```

---

## 🐛 Troubleshooting

**"Ollama Offline" badge showing:**
```bash
ollama serve          # Make sure this is running
ollama list           # Check llama3.2 is downloaded
ollama pull llama3.2  # Re-download if missing
```

**"Backend not running" error in frontend:**
```bash
cd backend && node server.js  # Make sure backend is running on port 3001
```

**Voice input not working:**
- Use Chrome or Edge browser
- Allow microphone access when prompted

**JSON parse error from Ollama:**
- Try a different model: `OLLAMA_MODEL=mistral node server.js`
- The model might need a warm-up — try again

---

## 💡 Example Inputs to Test

```
"Patient Sarah Collins just called. She needs a refill for her Amoxicillin 250mg, 1 pill 3 times a day for 7 days."

"John Doe requires Ibuprofen 400mg, 2 tablets twice daily for 10 days."

"Emily Carter needs Metformin 500mg once a day for 30 days."

"New patient Mike needs Paracetamol 500mg, 1 tablet 4 times a day for 3 days."
```
