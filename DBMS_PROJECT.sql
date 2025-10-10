CREATE DATABASE temporal_bank;
USE temporal_bank;

CREATE TABLE accounts_current (
  account_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(5) DEFAULT 'INR',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts_history (
  hist_id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT,
  customer_name VARCHAR(100),
  balance DECIMAL(15,2),
  currency VARCHAR(5),
  txn_id INT,
  txn_type VARCHAR(20),
  operation VARCHAR(20),
  tx_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts_current(account_id)
);
SHOW TABLES;
DESC accounts_current;
DESC accounts_history;

-- to load the file 

SHOW VARIABLES LIKE 'secure_file_priv';
LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/accounts.csv'
INTO TABLE accounts_current
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(account_id, customer_name, balance, currency, status);
SELECT * FROM accounts_current;

-- Triggers 

DELIMITER //
CREATE TRIGGER after_account_insert
AFTER INSERT ON accounts_current
FOR EACH ROW
BEGIN
    INSERT INTO accounts_history(account_id, customer_name, balance, currency, txn_type, operation)
    VALUES (NEW.account_id, NEW.customer_name, NEW.balance, NEW.currency, 'INSERT', 'INSERT');
END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS after_account_update;
DROP TRIGGER IF EXISTS after_deposit;
DROP TRIGGER IF EXISTS after_withdrawal;

DELIMITER //
CREATE TRIGGER after_account_update
AFTER UPDATE ON accounts_current
FOR EACH ROW
BEGIN
    IF NEW.balance > OLD.balance THEN
        INSERT INTO accounts_history(account_id, customer_name, balance, currency, txn_type, operation)
        VALUES (NEW.account_id, NEW.customer_name, NEW.balance, NEW.currency, 'UPDATE', 'DEPOSIT');
    ELSEIF NEW.balance < OLD.balance THEN
        INSERT INTO accounts_history(account_id, customer_name, balance, currency, txn_type, operation)
        VALUES (NEW.account_id, NEW.customer_name, NEW.balance, NEW.currency, 'UPDATE', 'WITHDRAWAL');
    END IF;
END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS after_account_delete;
DELIMITER //
CREATE TRIGGER after_account_delete
AFTER DELETE ON accounts_current
FOR EACH ROW
BEGIN
    INSERT INTO accounts_history(account_id, customer_name, balance, currency, txn_type, operation)
    VALUES (OLD.account_id, OLD.customer_name, OLD.balance, OLD.currency, 'DELETE', 'DELETE');
END;
//
DELIMITER ;

-- updation to check trigger

UPDATE accounts_current SET balance = balance + 200 WHERE account_id = 1;
UPDATE accounts_current SET balance = balance - 50 WHERE account_id = 1;
SELECT * FROM accounts_history WHERE account_id = 1;


-- AS OF queries

DELIMITER //
CREATE PROCEDURE get_balance_as_of(IN acc_id INT, IN as_of_time DATETIME)
BEGIN
  SELECT account_id, customer_name, balance, currency, tx_time, operation
  FROM accounts_history
  WHERE account_id = acc_id
    AND tx_time <= as_of_time
  ORDER BY tx_time DESC
  LIMIT 1;
END;
//
DELIMITER ;

UPDATE accounts_current SET balance = balance + 50 WHERE account_id = 2;
SELECT * FROM accounts_history WHERE account_id = 2;

-- check AS OF 
CALL get_balance_as_of(2, '2025-10-11 00:23:13');
SELECT * FROM accounts_current WHERE account_id = 2;

DROP PROCEDURE IF EXISTS rollback_account;

-- rollback function

DELIMITER //
CREATE PROCEDURE rollback_account(IN acc_id INT, IN rollback_time DATETIME)
BEGIN
  DECLARE old_balance DECIMAL(15,2);
  DECLARE record_found INT DEFAULT 0;

  -- Try to get the last known balance before or at rollback time
  SELECT balance INTO old_balance
  FROM accounts_history
  WHERE account_id = acc_id
    AND tx_time <= rollback_time
  ORDER BY tx_time DESC
  LIMIT 1;
  -- Check if a record was found
  IF old_balance IS NOT NULL THEN
    SET record_found = 1;
  END IF;
  -- If record found, perform rollback
  IF record_found = 1 THEN
    UPDATE accounts_current
    SET balance = old_balance
    WHERE account_id = acc_id;
    INSERT INTO accounts_history(account_id, customer_name, balance, currency, txn_type, operation)
    SELECT account_id, customer_name, balance, currency, 'ROLLBACK', 'ROLLBACK'
    FROM accounts_current
    WHERE account_id = acc_id;
  ELSE
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No valid history found before given time — rollback cancelled';
  END IF;
END;
//
DELIMITER ;


UPDATE accounts_current SET balance = balance + 1000 WHERE account_id = 3;
SELECT * FROM accounts_history WHERE account_id = 3;

UPDATE accounts_current SET balance = balance + 1000 WHERE account_id = 3;
SELECT * FROM accounts_history WHERE account_id = 3;

-- to check rollback 
CALL rollback_account(3, '2025-10-11 00:31:52');
SELECT * FROM accounts_current WHERE account_id = 3;





