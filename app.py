from flask import Flask, jsonify, request
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_PATH = "temporal_bank.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts_current;")
        accounts = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(accounts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history/<int:acc_id>', methods=['GET'])
def history(acc_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts_history WHERE account_id=? ORDER BY tx_time;", (acc_id,))
        history_records = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(history_records)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/rollback', methods=['POST'])
def rollback():
    data = request.json
    acc_id = data.get('acc_id')
    time = data.get('time')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Try to get the last known balance before or at rollback time
        cursor.execute("""
            SELECT balance FROM accounts_history
            WHERE account_id = ? AND tx_time <= ?
            ORDER BY tx_time DESC LIMIT 1
        """, (acc_id, time))
        
        row = cursor.fetchone()
        if not row:
            conn.close()
            return jsonify({"error": "No valid history found before given time — rollback cancelled"}), 400
            
        old_balance = row['balance']
        
        # Update current accounts (this fires the UPDATE trigger, adding a DEPOSIT/WITHDRAWAL to history)
        cursor.execute("UPDATE accounts_current SET balance = ? WHERE account_id = ?", (old_balance, acc_id))
        
        # Also explicitly log a 'ROLLBACK' to mimic original behavior
        cursor.execute("""
            INSERT INTO accounts_history(account_id, customer_name, balance, currency, txn_type, operation)
            SELECT account_id, customer_name, balance, currency, 'ROLLBACK', 'ROLLBACK'
            FROM accounts_current
            WHERE account_id = ?
        """, (acc_id,))
        
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/as_of', methods=['POST'])
def as_of():
    data = request.json
    acc_id = data.get('acc_id')
    time = data.get('time')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT account_id, customer_name, balance, currency, tx_time, operation
            FROM accounts_history
            WHERE account_id = ? AND tx_time <= ?
            ORDER BY tx_time DESC LIMIT 1
        """, (acc_id, time))
        
        rows = cursor.fetchall()
        result_data = [dict(row) for row in rows]
        conn.close()
        return jsonify(result_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transaction', methods=['POST'])
def create_transaction():
    # The frontend expects to create a transaction, so let's add an endpoint for it!
    # Looking at the original MySQL there was no direct endpoint, it was tested directly via SQL.
    # The React app "CreateTransaction" page probably POSTs here.
    data = request.json
    acc_id = data.get('account_id')
    amount = float(data.get('amount', 0))
    txn_type = data.get('type') # 'DEPOSIT' or 'WITHDRAWAL'
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if txn_type == 'WITHDRAWAL':
            cursor.execute("UPDATE accounts_current SET balance = balance - ? WHERE account_id = ?", (amount, acc_id))
        else:
            cursor.execute("UPDATE accounts_current SET balance = balance + ? WHERE account_id = ?", (amount, acc_id))
            
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
