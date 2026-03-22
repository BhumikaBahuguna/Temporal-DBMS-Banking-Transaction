# Temporal-DBMS-Banking-Transaction 🕰️🏦

✨ *“Data fades, but history remains — with Temporal DBMS.”*

A full-stack banking transaction system demonstrating the power of Temporal Databases. It keeps track of every account change, enabling time-travel queries, auditable transaction histories, and seamless rollback operations.

---

## ⚙️ Project Overview
Traditionally, banking applications only store the latest balance. This project implements a **Temporal Database Management System (T-DBMS)** that stores complete transaction and balance histories. 

Originally built using MySQL, this project has been fully refactored to use a **Portable SQLite Database** alongside a modern **React (Vite) Frontend** and a **Python Flask API Backend**.

💡 **How it works:**  
The database utilizes SQLite **Triggers** to automatically maintain two core tables:
1. `accounts_current` → Holds the latest account state.
2. `accounts_history` → Automatically logs every past transaction, balance update, and deletion.

---

## 🌟 Key Features
- **Automatic History Tracking:** Triggers silently and instantly record every insertion, transfer, or deletion.
- **Time-Travel AS-OF Queries:** Reconstruct what a user's balance and state looked like at *any* specific date and time in the past.
- **Point-in-Time Rollback:** Instantly rewind an account's balance back to a historical state safely, which is subsequently logged as a `ROLLBACK` transaction.
- **Modern Architecture:** A decoupled RESTful JSON API using Flask and a sleek UI powered by React, Tailwind-like CSS, and Framer Motion.

---

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, React Router, Recharts, Framer Motion
* **Backend:** Python 3, Flask, Flask-CORS
* **Database:** SQLite (Embedded, zero-configuration)

---

## 🚀 Getting Started (VS Code)

Because the project is entirely portable, you do not need XAMPP, MySQL, or PostgreSQL installed to run this project!

### 1. Prerequisites
- **Python 3.x** installed.
- **Node.js** installed.

### 2. Initialization & Setup
Clone the repository and open it in VS Code:
```bash
git clone https://github.com/BhumikaBahuguna/Temporal-DBMS-Banking-Transaction.git
cd Temporal-DBMS-Banking-Transaction
```

**Set up the Python Backend & Database:**
Open a terminal in the root folder and run:
```powershell
# Create a virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install flask flask-cors

# Initialize the database (Seeds data from accounts.csv into temporal_bank.db)
python init_db.py
```

**Set up the React Frontend:**
Open a second terminal, navigate to the `client` folder, and run:
```powershell
cd client
npm install
```

---

## 💻 Running the Application

There are two ways to start the project. 

### Method A: One-Click Quick Start (Windows)
Double-click the **`run.bat`** file in the root folder. It will automatically open the required terminals and boot both servers simultaneously.

### Method B: Manual Split Terminal (VS Code)
If you prefer running it manually within VS Code, open **two split terminal windows** (`Ctrl + Shift + 5`).

**Terminal 1 (Backend API):**
```powershell
# Make sure you are in the root directory
.\.venv\Scripts\python.exe app.py
```
*(Runs on http://127.0.0.1:5000)*

**Terminal 2 (Frontend UI):**
```powershell
# Make sure you are in the /client directory
cd client
npm run dev
```
*(Runs on http://localhost:5173)*

You can now open `http://localhost:5173` in your browser and start executing transactions!

---

## 🧪 Testing the Temporal Behavior
1. **Navigate to "New Transaction"** and deposit ₹5,000 into an account.
2. Observe the account's history timeline automatically update in the dashboard via SQLite triggers.
3. **Navigate to the "AS-OF Query"** page. Enter the account ID and pick a timestamp from *before* you made the deposit. The database will accurately rebuild the old balance!
4. **Use the "Rollback"** page to officially undo the deposit, reverting the account to its previous balance state permanently.
