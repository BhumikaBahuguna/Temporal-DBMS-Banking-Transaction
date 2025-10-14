# Temporal-DBMS-Banking-Transaction

🏦💾 Temporal DBMS — Banking Transaction System

🔁 A PostgreSQL-powered Temporal Database that keeps track of every account change, enabling time-travel queries and auditable transaction history

⚙️ Project Overview

A Temporal Database Management System (T-DBMS) designed for banking applications that stores complete transaction and balance history, not just the latest balance.

💡 Implemented using PostgreSQL with database triggers to automatically maintain two tables:

🧾 Current Table → Holds the latest account state

⏳ History Table → Stores every past transaction and balance update

🧭 Purpose

To maintain an immutable, queryable record of all account states and changes for each banking transaction.

You can even ask:

💬 “What was the balance of Account #123 on March 10th?”

and get the answer directly from the database!

🌟 Key Features

✅ Automatic History Tracking
→ PostgreSQL triggers record every update, insert, or delete automatically.

✅ Time-Travel Queries
→ Retrieve past balances and transactions at any date or time.

✅ Auditing & Compliance
→ Perfect for fraud detection, financial audits, and rollback checks.

✅ Error Correction
→ View and restore old account states safely.

🗂️ Database Flow
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
