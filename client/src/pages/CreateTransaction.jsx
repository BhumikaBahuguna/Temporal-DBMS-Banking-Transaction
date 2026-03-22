import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  DollarSign, 
  User, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bankingAPI } from '../services/api';
import './CreateTransaction.css';

const CreateTransaction = () => {
  const [formData, setFormData] = useState({
    accountId: '',
    transactionType: 'deposit',
    amount: '',
    description: ''
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const accountsData = await bankingAPI.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const selectedAccount = accounts.find(acc => acc.account_id === parseInt(formData.accountId));
    if (formData.transactionType === 'withdrawal' && amount > selectedAccount.balance) {
      toast.error('Insufficient funds for withdrawal');
      return;
    }

    try {
      setLoading(true);
      
      // Execute the transaction
      await bankingAPI.createTransaction(parseInt(formData.accountId), amount, formData.transactionType);
      
      // Create result object for display
      const result = {
        transactionId: Math.floor(Math.random() * 1000000),
        accountId: parseInt(formData.accountId),
        customerName: selectedAccount.customer_name,
        transactionType: formData.transactionType,
        amount: amount,
        previousBalance: selectedAccount.balance,
        newBalance: formData.transactionType === 'deposit' 
          ? selectedAccount.balance + amount 
          : selectedAccount.balance - amount,
        timestamp: new Date().toISOString(),
        description: formData.description || `${formData.transactionType.charAt(0).toUpperCase() + formData.transactionType.slice(1)} transaction`
      };
      
      setTransactionResult(result);
      setSuccess(true);
      toast.success('Transaction completed successfully!');
      
      // Reset form after successful transaction
      setTimeout(() => {
        setFormData({
          accountId: '',
          transactionType: 'deposit',
          amount: '',
          description: ''
        });
        setSuccess(false);
        setTransactionResult(null);
      }, 5000);
      
    } catch (error) {
      toast.error('Failed to process transaction');
      console.error('Error processing transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    return type === 'deposit' ? 
      <ArrowUpRight className="text-success" size={20} /> : 
      <ArrowDownRight className="text-error" size={20} />;
  };

  const getTransactionColor = (type) => {
    return type === 'deposit' ? 'text-success' : 'text-error';
  };

  const getTransactionBadgeClass = (type) => {
    return type === 'deposit' ? 'badge-success' : 'badge-danger';
  };

  return (
    <div className="create-transaction">
      {/* Header */}
      <div className="transaction-header">
        <div className="header-content">
          <div className="header-icon">
            <DollarSign className="text-primary" />
          </div>
          <div className="header-text">
            <h1>Create Transaction</h1>
            <p>Process deposits and withdrawals</p>
          </div>
        </div>
      </div>

      <div className="transaction-content">
        {/* Transaction Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="transaction-form-card"
        >
          <div className="form-header">
            <h2>New Transaction</h2>
            <Plus className="text-primary" />
          </div>

          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accountId" className="form-label">
                  <User size={16} />
                  Select Account
                </label>
                <select
                  id="accountId"
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Choose an account...</option>
                  {accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      #{account.account_id} - {account.customer_name} ({formatCurrency(account.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="transactionType" className="form-label">
                  Transaction Type
                </label>
                <div className="transaction-type-buttons">
                  <label className={`type-button ${formData.transactionType === 'deposit' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="transactionType"
                      value="deposit"
                      checked={formData.transactionType === 'deposit'}
                      onChange={handleInputChange}
                    />
                    <Plus size={16} />
                    Deposit
                  </label>
                  <label className={`type-button ${formData.transactionType === 'withdrawal' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="transactionType"
                      value="withdrawal"
                      checked={formData.transactionType === 'withdrawal'}
                      onChange={handleInputChange}
                    />
                    <Minus size={16} />
                    Withdrawal
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount" className="form-label">
                  <DollarSign size={16} />
                  Amount ({formData.transactionType === 'deposit' ? 'INR' : 'INR'})
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  required
                />
                {formData.accountId && (
                  <small className="form-help">
                    Current balance: {formatCurrency(
                      accounts.find(acc => acc.account_id === parseInt(formData.accountId))?.balance || 0
                    )}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Transaction description"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`btn btn-lg ${formData.transactionType === 'deposit' ? 'btn-success' : 'btn-danger'}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {getTransactionIcon(formData.transactionType)}
                    {formData.transactionType === 'deposit' ? 'Deposit' : 'Withdraw'} Funds
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Transaction Result */}
        {success && transactionResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="result-card success"
          >
            <div className="result-header">
              <div className="result-title">
                <CheckCircle className="text-success" />
                <h3>Transaction Successful</h3>
              </div>
              <Calendar className="text-primary" />
            </div>

            <div className="result-content">
              <div className="transaction-summary">
                <div className="summary-item">
                  <span className="summary-label">Transaction ID</span>
                  <span className="summary-value">#{transactionResult.transactionId}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Account</span>
                  <span className="summary-value">#{transactionResult.accountId} - {transactionResult.customerName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Type</span>
                  <span className={`summary-value badge ${getTransactionBadgeClass(transactionResult.transactionType)}`}>
                    {transactionResult.transactionType.toUpperCase()}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Amount</span>
                  <span className={`summary-value ${getTransactionColor(transactionResult.transactionType)}`}>
                    {formatCurrency(transactionResult.amount)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Previous Balance</span>
                  <span className="summary-value">{formatCurrency(transactionResult.previousBalance)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">New Balance</span>
                  <span className="summary-value font-bold">{formatCurrency(transactionResult.newBalance)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Timestamp</span>
                  <span className="summary-value">{formatDate(transactionResult.timestamp)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="info-card"
        >
          <div className="info-header">
            <AlertTriangle className="text-warning" />
            <h3>Transaction Guidelines</h3>
          </div>
          
          <div className="info-content">
            <div className="guidelines">
              <div className="guideline-item">
                <h4>Deposits</h4>
                <ul>
                  <li>Minimum deposit amount: ₹1</li>
                  <li>Maximum deposit amount: ₹1,00,000 per transaction</li>
                  <li>Deposits are processed immediately</li>
                </ul>
              </div>
              
              <div className="guideline-item">
                <h4>Withdrawals</h4>
                <ul>
                  <li>Minimum withdrawal amount: ₹1</li>
                  <li>Cannot exceed current account balance</li>
                  <li>Withdrawals are processed immediately</li>
                </ul>
              </div>
            </div>
            
            <div className="info-note">
              <strong>Note:</strong> All transactions are recorded in the system history 
              and can be queried using AS-OF queries or rolled back if necessary.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateTransaction;
