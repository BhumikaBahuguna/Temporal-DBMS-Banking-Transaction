import sqlite3
import csv
import os

DB_PATH = "temporal_bank.db"
CSV_PATH = "accounts.csv"

def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create tables
    cursor.execute('''
    CREATE TABLE accounts_current (
        account_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0.00,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ''')
    
    cursor.execute('''
    CREATE TABLE accounts_history (
        hist_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER,
        customer_name TEXT,
        balance REAL,
        currency TEXT,
        txn_id INTEGER,
        txn_type TEXT,
        operation TEXT,
        tx_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts_current (account_id)
    );
    ''')

    # Triggers for INSERT
    cursor.execute('''
    CREATE TRIGGER after_account_insert
    AFTER INSERT ON accounts_current
    BEGIN
        INSERT INTO accounts_history(account_id, customer_name, balance, currency, txn_type, operation)
        VALUES (NEW.account_id, NEW.customer_name, NEW.balance, NEW.currency, 'INSERT', 'INSERT');
    END;
    ''')

    # Triggers for UPDATE
    cursor.execute('''
    CREATE TRIGGER after_account_update
    AFTER UPDATE ON accounts_current
    BEGIN
        INSERT INTO accounts_history(account_id, customer_name, balance, currency, txn_type, operation)
        VALUES (
            NEW.account_id, 
            NEW.customer_name, 
            NEW.balance, 
            NEW.currency, 
            'UPDATE',
            CASE WHEN NEW.balance > OLD.balance THEN 'DEPOSIT' ELSE 'WITHDRAWAL' END
        );
    END;
    ''')

    # Triggers for DELETE
    cursor.execute('''
    CREATE TRIGGER after_account_delete
    AFTER DELETE ON accounts_current
    BEGIN
        INSERT INTO accounts_history(account_id, customer_name, balance, currency, txn_type, operation)
        VALUES (OLD.account_id, OLD.customer_name, OLD.balance, OLD.currency, 'DELETE', 'DELETE');
    END;
    ''')

    # Load from CSV
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, encoding='utf-8-sig', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # The CSV has headers: account_id, customer_name, balance, currency, status
                # But auto-increment will override account_id if we do not specify it, though it's safer to specify.
                cursor.execute('''
                    INSERT INTO accounts_current(account_id, customer_name, balance, currency, status) 
                    VALUES(?, ?, ?, ?, ?)
                ''', (
                    row['account_id'],
                    row['customer_name'],
                    row['balance'],
                    row['currency'],
                    row['status']
                ))
    else:
        print(f"Warning: {CSV_PATH} not found, skipping initial data load.")

    conn.commit()
    conn.close()
    print("Database initialized successfully at temporal_bank.db")

if __name__ == "__main__":
    init_db()
