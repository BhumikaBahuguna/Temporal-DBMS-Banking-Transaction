 import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Clock,
  DollarSign,
  User,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { bankingAPI } from '../services/api';
import './AccountDetail.css';

const AccountDetail = () => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchAccountData();
  }, [id]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      
      // Fetch account data from API
      const accountsData = await bankingAPI.getAccounts();
      const accountData = accountsData.find(acc => acc.account_id === parseInt(id));
      
      if (!accountData) {
        toast.error('Account not found');
        return;
      }
      
      // Fetch transaction history
      const historyData = await bankingAPI.getAccountHistory(parseInt(id));
      
      setAccount(accountData);
      setHistory(historyData);
      
      // Prepare chart data
      const chartData = historyData.map((record, index) => ({
        time: new Date(record.tx_time).toLocaleDateString(),
        balance: record.balance,
        operation: record.operation,
        index: index
      }));
      setChartData(chartData);
      
      toast.success('Account data loaded successfully');
    } catch (error) {
      toast.error('Failed to load account data');
      console.error('Error fetching account data:', error);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOperationIcon = (operation) => {
    switch (operation) {
      case 'DEPOSIT':
        return <ArrowUpRight className="text-success" size={16} />;
      case 'WITHDRAWAL':
        return <ArrowDownRight className="text-error" size={16} />;
      case 'INSERT':
        return <User className="text-primary" size={16} />;
      case 'ROLLBACK':
        return <Clock className="text-warning" size={16} />;
      default:
        return <Activity className="text-neutral-500" size={16} />;
    }
  };

  const getOperationColor = (operation) => {
    switch (operation) {
      case 'DEPOSIT':
        return 'text-success';
      case 'WITHDRAWAL':
        return 'text-error';
      case 'INSERT':
        return 'text-primary';
      case 'ROLLBACK':
        return 'text-warning';
      default:
        return 'text-neutral-500';
    }
  };

  const getOperationBadgeClass = (operation) => {
    switch (operation) {
      case 'DEPOSIT':
        return 'badge-success';
      case 'WITHDRAWAL':
        return 'badge-danger';
      case 'INSERT':
        return 'badge-info';
      case 'ROLLBACK':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  if (loading) {
    return (
      <div className="account-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading account details...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="account-not-found">
        <h2>Account Not Found</h2>
        <p>The account you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="account-detail">
      {/* Header */}
      <div className="account-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        
        <div className="account-info">
          <div className="account-title">
            <h1>Account #{account.account_id}</h1>
            <span className={`badge badge-${account.status === 'active' ? 'success' : 'warning'}`}>
              {account.status}
            </span>
          </div>
          <p className="account-subtitle">{account.customer_name}</p>
        </div>
      </div>

      {/* Account Overview */}
      <div className="account-overview">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overview-card"
        >
          <div className="balance-section">
            <div className="balance-icon">
              <DollarSign className="text-primary" />
            </div>
            <div className="balance-content">
              <h2 className="current-balance">{formatCurrency(account.balance)}</h2>
              <p className="balance-label">Current Balance</p>
            </div>
          </div>
          
          <div className="account-meta">
            <div className="meta-item">
              <span className="meta-label">Currency</span>
              <span className="meta-value">{account.currency}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Account Created</span>
              <span className="meta-value">{formatDate(account.created_at)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Total Transactions</span>
              <span className="meta-value">{history.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Balance Trend Chart */}
      <div className="chart-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="chart-card"
        >
          <div className="chart-header">
            <h3>Balance Trend</h3>
            <TrendingUp className="text-primary" />
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Balance']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <div className="transaction-history">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="history-card"
        >
          <div className="history-header">
            <h3>Transaction History</h3>
            <Calendar className="text-primary" />
          </div>

          <div className="timeline">
            {history.map((transaction, index) => (
              <motion.div
                key={transaction.hist_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="timeline-item"
              >
                <div className="timeline-marker">
                  {getOperationIcon(transaction.operation)}
                </div>
                
                <div className="timeline-content">
                  <div className="transaction-header">
                    <div className="transaction-info">
                      <h4 className={`operation ${getOperationColor(transaction.operation)}`}>
                        {transaction.operation}
                      </h4>
                      <span className="transaction-time">
                        {formatDate(transaction.tx_time)}
                      </span>
                    </div>
                    <div className="transaction-balance">
                      <span className={`balance ${getOperationColor(transaction.operation)}`}>
                        {formatCurrency(transaction.balance)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="transaction-details">
                    <span className={`badge ${getOperationBadgeClass(transaction.operation)}`}>
                      {transaction.txn_type}
                    </span>
                    <span className="transaction-id">
                      History ID: {transaction.hist_id}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountDetail;
