# Temporal-DBMS-Banking-Transaction
##✨ “Data fades, but history remains — with Temporal DBMS.” 🕰️

##🏦💾 Temporal DBMS — Banking Transaction System

🔁 A PostgreSQL-powered Temporal Database that keeps track of every account change, enabling time-travel queries and auditable transaction history

##⚙️ Project Overview

A Temporal Database Management System (T-DBMS) designed for banking applications that stores complete transaction and balance history, not just the latest balance.

💡 Implemented using PostgreSQL with database triggers to automatically maintain two tables:

🧾 Current Table → Holds the latest account state

⏳ History Table → Stores every past transaction and balance update

##🧭 Purpose

To maintain an immutable, queryable record of all account states and changes for each banking transaction.

You can even ask:

💬 “What was the balance of Account #123 on March 10th?”

and get the answer directly from the database!

##🌟 Key Features

✅ Automatic History Tracking
→ PostgreSQL triggers record every update, insert, or delete automatically.

✅ Time-Travel Queries
→ Retrieve past balances and transactions at any date or time.

✅ Auditing & Compliance
→ Perfect for fraud detection, financial audits, and rollback checks.

✅ Error Correction
→ View and restore old account states safely.

##🗂️ Database Flow

```
             ┌────────────────────────────┐
             │        Transactions         │
             └──────────────┬─────────────┘
                            │
                 (TRIGGER fires automatically)
                            │
       ┌────────────────────┴────────────────────┐
       │                                         │
┌───────────────┐                       ┌────────────────┐
│ Current Table │   <-- latest state --> │ History Table  │
└───────────────┘                       └────────────────┘
        │                                         │
        ▼                                         ▼
   User Queries                            Time-Travel Queries
```

##🚀 Getting Started

Clone this repository

git clone https://github.com/your-username/Temporal-DBMS-Banking-Transaction.git
cd Temporal-DBMS-Banking-Transaction


Set up PostgreSQL
Import the provided table and trigger SQL scripts.

Insert Sample Data
Run example inserts to simulate transactions.

Run Queries

SELECT * FROM current_accounts;
SELECT * FROM history_accounts;

##🧪 Testing the Temporal Behavior

Perform inserts and updates on the current_accounts table —
each change will automatically be recorded in the history_accounts table via triggers.

🧭 Example:

UPDATE current_accounts 
SET balance = balance - 200 
WHERE account_id = 123;

SELECT * FROM history_accounts;


👉 You’ll see both old and new states logged automatically!

##🌍 Real-World Applications

🔍 Fraud Detection – Track suspicious transactions over time.
📊 Audit & Compliance – Keep complete transaction trails for regulators.
🧩 Error Recovery – Restore old account states when corrections are needed.

##🛠️ Tech Stack

🐘 PostgreSQL (Database Engine)

⚙️ SQL Triggers & Functions (Automation Layer)

💻 SQL Client / pgAdmin (Query Interface)

##🏁 Summary

This Temporal-DBMS-Banking-Transaction project showcases how temporal data modeling and PostgreSQL triggers can be used to create a time-aware, self-auditing banking database — perfect for modern financial systems that demand transparency and historical insight.
