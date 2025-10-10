from flask import Flask, render_template, request, redirect
import mysql.connector

app = Flask(__name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Koyelbiswas@2003",
        database="temporal_bank"
    )

@app.route('/')
def home():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM accounts_current;")
    accounts = cursor.fetchall()
    conn.close()
    return render_template('index.html', accounts=accounts)

@app.route('/history/<int:acc_id>')
def history(acc_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM accounts_history WHERE account_id=%s ORDER BY tx_time;", (acc_id,))
    history = cursor.fetchall()
    conn.close()
    return render_template('history.html', history=history, acc_id=acc_id)

@app.route('/rollback', methods=['GET', 'POST'])
def rollback():
    if request.method == 'POST':
        acc_id = request.form['acc_id']
        time = request.form['time']
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.callproc('rollback_account', (acc_id, time))
        conn.commit()
        conn.close()
        return redirect('/')
    return render_template('rollback.html')

@app.route('/as_of', methods=['GET', 'POST'])
def as_of():
    if request.method == 'POST':
        acc_id = request.form['acc_id']
        time = request.form['time']
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('get_balance_as_of', (acc_id, time))
        for result in cursor.stored_results():
            data = result.fetchall()
        conn.close()
        return render_template('asof.html', data=data)
    return render_template('asof.html', data=None)

if __name__ == '__main__':
    app.run(debug=True)
