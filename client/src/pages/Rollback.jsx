import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  AlertTriangle, 
  User, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  History,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bankingAPI } from '../services/api';
import './Rollback.css';

const Rollback = () => {
  const [formData, setFormData] = useState({
    accountId: '',
    timestamp: '',
    confirmation: ''
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [rollbackPreview, setRollbackPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [rollbackResult, setRollbackResult] = useState(null);

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

  const handlePreviewRollback = async () => {
    if (!formData.accountId || !formData.timestamp) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Mock rollback preview
      const selectedAccount = accounts.find(acc => acc.account_id === parseInt(formData.accountId));
      const mockPreview = {
        accountId: parseInt(formData.accountId),
        customerName: selectedAccount.customer_name,
        currentBalance: selectedAccount.balance,
        rollbackTimestamp: formData.timestamp,
        estimatedBalance: Math.floor(Math.random() * selectedAccount.balance),
        transactionsAffected: Math.floor(Math.random() * 5) + 1,
        lastTransactionBefore: {
          timestamp: new Date(new Date(formData.timestamp).getTime() - 3600000).toISOString(),
          operation: 'DEPOSIT',
          amount: Math.floor(Math.random() * 1000) + 100
        }
      };

      setRollbackPreview(mockPreview);
      setShowConfirmation(true);
      toast.success('Rollback preview generated');
    } catch (error) {
      toast.error('Failed to generate rollback preview');
      console.error('Error generating preview:', error);
    }
  };

  const handleConfirmRollback = async () => {
    if (formData.confirmation.toLowerCase() !== 'confirm rollback') {
      toast.error('Please type "CONFIRM ROLLBACK" to proceed');
      return;
    }

    try {
      setLoading(true);
      
      // Execute the rollback
      const result = await bankingAPI.rollbackTransaction(rollbackPreview.accountId, formData.timestamp);
      
      if (result.success) {
        // Create result object for display
        const rollbackResult = {
          rollbackId: Math.floor(Math.random() * 1000000),
          accountId: rollbackPreview.accountId,
          customerName: rollbackPreview.customerName,
          previousBalance: rollbackPreview.currentBalance,
          newBalance: rollbackPreview.estimatedBalance,
          rollbackTimestamp: formData.timestamp,
          transactionsRolledBack: rollbackPreview.transactionsAffected,
          timestamp: new Date().toISOString(),
          status: 'completed'
        };
        
        setRollbackResult(rollbackResult);
        setSuccess(true);
        toast.success('Rollback completed successfully!');
        
        // Reset form after successful rollback
        setTimeout(() => {
          setFormData({
            accountId: '',
            timestamp: '',
            confirmation: ''
          });
          setShowConfirmation(false);
          setRollbackPreview(null);
          setSuccess(false);
          setRollbackResult(null);
        }, 8000);
      } else {
        toast.error(result.message || 'Rollback failed');
      }
      
    } catch (error) {
      toast.error('Failed to execute rollback');
      console.error('Error executing rollback:', error);
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
    <div className="rollback">
      {/* Header */}
      <div className="rollback-header">
        <div className="header-content">
          <div className="header-icon">
            <RotateCcw className="text-primary" />
          </div>
          <div className="header-text">
            <h1>Transaction Rollback</h1>
            <p>Revert account to a previous state</p>
          </div>
        </div>
      </div>

      <div className="rollback-content">
        {/* Rollback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rollback-form-card"
        >
          <div className="form-header">
            <h2>Rollback Configuration</h2>
            <Shield className="text-primary" />
          </div>

          <form className="rollback-form">
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
                  Rollback To Date & Time
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
                  Select the date and time to rollback to
                </small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handlePreviewRollback}
                className="btn btn-secondary btn-lg"
                disabled={!formData.accountId || !formData.timestamp}
              >
                <History size={20} />
                Preview Rollback
              </button>
            </div>
          </form>
        </motion.div>

        {/* Rollback Preview */}
        {showConfirmation && rollbackPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="preview-card warning"
          >
            <div className="preview-header">
              <div className="preview-title">
                <AlertTriangle className="text-warning" />
                <h3>Rollback Preview</h3>
              </div>
              <Clock className="text-primary" />
            </div>

            <div className="preview-content">
              <div className="warning-banner">
                <AlertTriangle className="text-warning" />
                <div className="warning-text">
                  <h4>Warning: This action cannot be undone!</h4>
                  <p>Rolling back will permanently remove all transactions after the selected timestamp.</p>
                </div>
              </div>

              <div className="preview-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Account</span>
                    <span className="detail-value">#{rollbackPreview.accountId} - {rollbackPreview.customerName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Current Balance</span>
                    <span className="detail-value">{formatCurrency(rollbackPreview.currentBalance)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rollback To</span>
                    <span className="detail-value">{formatDate(rollbackPreview.rollbackTimestamp)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estimated Balance</span>
                    <span className="detail-value">{formatCurrency(rollbackPreview.estimatedBalance)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Transactions Affected</span>
                    <span className="detail-value">{rollbackPreview.transactionsAffected}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Transaction Before</span>
                    <span className="detail-value">
                      {rollbackPreview.lastTransactionBefore.operation} - {formatDate(rollbackPreview.lastTransactionBefore.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="confirmation-section">
                <div className="form-group">
                  <label htmlFor="confirmation" className="form-label">
                    Type "CONFIRM ROLLBACK" to proceed
                  </label>
                  <input
                    type="text"
                    id="confirmation"
                    name="confirmation"
                    value={formData.confirmation}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="CONFIRM ROLLBACK"
                    required
                  />
                </div>

                <div className="confirmation-actions">
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(false)}
                    className="btn btn-secondary"
                  >
                    <XCircle size={16} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRollback}
                    className="btn btn-danger btn-lg"
                    disabled={loading || formData.confirmation.toLowerCase() !== 'confirm rollback'}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Rolling Back...
                      </>
                    ) : (
                      <>
                        <RotateCcw size={20} />
                        Execute Rollback
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rollback Result */}
        {success && rollbackResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="result-card success"
          >
            <div className="result-header">
              <div className="result-title">
                <CheckCircle className="text-success" />
                <h3>Rollback Completed</h3>
              </div>
              <Clock className="text-primary" />
            </div>

            <div className="result-content">
              <div className="rollback-summary">
                <div className="summary-item">
                  <span className="summary-label">Rollback ID</span>
                  <span className="summary-value">#{rollbackResult.rollbackId}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Account</span>
                  <span className="summary-value">#{rollbackResult.accountId} - {rollbackResult.customerName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Previous Balance</span>
                  <span className="summary-value">{formatCurrency(rollbackResult.previousBalance)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">New Balance</span>
                  <span className="summary-value font-bold">{formatCurrency(rollbackResult.newBalance)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Rollback To</span>
                  <span className="summary-value">{formatDate(rollbackResult.rollbackTimestamp)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Transactions Rolled Back</span>
                  <span className="summary-value">{rollbackResult.transactionsRolledBack}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Completed At</span>
                  <span className="summary-value">{formatDate(rollbackResult.timestamp)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Status</span>
                  <span className="summary-value badge badge-success">{rollbackResult.status}</span>
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
            <h3>Rollback Guidelines</h3>
          </div>
          
          <div className="info-content">
            <div className="guidelines">
              <div className="guideline-item">
                <h4>What is Rollback?</h4>
                <p>
                  Rollback allows you to revert an account to its state at a specific point in time. 
                  All transactions that occurred after the selected timestamp will be permanently removed.
                </p>
              </div>
              
              <div className="guideline-item">
                <h4>Important Considerations</h4>
                <ul>
                  <li>Rollback operations cannot be undone</li>
                  <li>All transactions after the rollback point will be lost</li>
                  <li>This action should only be performed by authorized personnel</li>
                  <li>Consider the impact on related systems and reports</li>
                </ul>
              </div>
            </div>
            
            <div className="info-note">
              <strong>Security Note:</strong> This is an administrative function that should only be used 
              in exceptional circumstances. Always verify the rollback parameters before execution.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Rollback;
