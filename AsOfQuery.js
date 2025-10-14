import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Search, 
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle,
  History
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bankingAPI } from '../services/api';
import './AsOfQuery.css';

const AsOfQuery = () => {
  const [formData, setFormData] = useState({
    accountId: '',
    timestamp: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);

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
    
    if (!formData.accountId || !formData.timestamp) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      const result = await bankingAPI.getBalanceAsOf(parseInt(formData.accountId), formData.timestamp);
      
      if (result && result.length > 0) {
        setResult(result[0]);
        toast.success('AS-OF query completed successfully');
      } else {
        toast.error('No data found for the specified time');
      }
    } catch (error) {
      toast.error('Failed to execute AS-OF query');
      console.error('Error executing AS-OF query:', error);
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

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="as-of-query">
      {/* Header */}
      <div className="query-header">
        <div className="header-content">
          <div className="header-icon">
            <Clock className="text-primary" />
          </div>
          <div className="header-text">
            <h1>AS-OF Query</h1>
            <p>Query account balance at any point in time</p>
          </div>
        </div>
      </div>

      <div className="query-content">
        {/* Query Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="query-form-card"
        >
          <div className="form-header">
            <h2>Historical Balance Lookup</h2>
            <Search className="text-primary" />
          </div>

          <form onSubmit={handleSubmit} className="query-form">
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
                      #{account.account_id} - {account.customer_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timestamp" className="form-label">
                  <Calendar size={16} />
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="timestamp"
                  name="timestamp"
                  value={formData.timestamp}
                  onChange={handleInputChange}
                  max={getCurrentDateTime()}
                  className="form-input"
                  required
                />
                <small className="form-help">
                  Select the date and time to query the balance
                </small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Querying...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Execute AS-OF Query
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Query Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="result-card"
          >
            <div className="result-header">
              <div className="result-title">
                <CheckCircle className="text-success" />
                <h3>Query Result</h3>
              </div>
              <History className="text-primary" />
            </div>

            <div className="result-content">
              <div className="result-balance">
                <div className="balance-icon">
                  <DollarSign className="text-primary" />
                </div>
                <div className="balance-info">
                  <h2 className="balance-amount">
                    {formatCurrency(result.balance)}
                  </h2>
                  <p className="balance-label">
                    Balance as of {formatDate(result.tx_time)}
                  </p>
                </div>
              </div>

              <div className="result-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Account ID</span>
                    <span className="detail-value">#{result.account_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Customer Name</span>
                    <span className="detail-value">{result.customer_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Currency</span>
                    <span className="detail-value">{result.currency}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Operation</span>
                    <span className={`detail-value badge badge-info`}>
                      {result.operation}
                    </span>
                  </div>
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
            <AlertCircle className="text-warning" />
            <h3>How AS-OF Queries Work</h3>
          </div>
          
          <div className="info-content">
            <p>
              AS-OF queries allow you to retrieve the account balance at any specific point in time. 
              This is particularly useful for:
            </p>
            
            <ul className="info-list">
              <li>Auditing and compliance reporting</li>
              <li>Historical analysis and trend tracking</li>
              <li>Dispute resolution and transaction verification</li>
              <li>Financial reporting and reconciliation</li>
            </ul>
            
            <div className="info-note">
              <strong>Note:</strong> The system will return the most recent balance record 
              that was recorded at or before the specified timestamp.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AsOfQuery;
