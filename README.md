# Temporal-DBMS-Banking-Transaction

A simple temporal database management system for banking applications that stores both the complete transaction and balance history—not just current balances. This project is implemented using PostgreSQL and database triggers to automatically maintain both a Current Table and a History Table for all transaction events.

Purpose
Maintain an immutable, queryable record of all account states and changes for each banking transaction.
Support "time-travel" queries, such as:
What was the balance of Account 123 on March 10th?

Features
Automatic history tracking using PostgreSQL triggers to log every update.
Current Table reflects latest account state; History Table stores all past states.
Enables time-travel queries and historical audits.
Supports compliance, fraud analysis, and error correction.

Getting Started
Clone this repository.
Set up MySQL and apply the included table and trigger scripts.
Insert transaction data as described in the usage examples.
Run sample queries to retrieve account status at any point in time.

Testing
You can verify temporal operations by running a series of inserts/updates on the current table, then listing (ls in your SQL client or SELECT *) the records in both current and history tables to see allocations (transactions) and deallocations (reversals/corrections).
Example:
SELECT * FROM current_accounts;
SELECT * FROM history_accounts;

Real-World Applications
Fraud Detection: Analyze suspicious account activity over time.
Audit Compliance: Ensure regulatory record-keeping with complete transaction history.

Error Correction: Restore and review previous account states for troubleshooting.

