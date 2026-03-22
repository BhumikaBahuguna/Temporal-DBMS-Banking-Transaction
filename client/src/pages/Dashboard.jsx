import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bankingAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('account_id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalBalance: 0,
    averageBalance: 0,
    activeAccounts: 0
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    filterAndSortAccounts();
  }, [accounts, searchTerm, sortBy, sortOrder]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await bankingAPI.getAccounts();
      setAccounts(accountsData);
      calculateStats(accountsData);
      toast.success('Accounts loaded successfully');
    } catch (error) {
      toast.error('Failed to load accounts');
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (accountsData) => {
    const totalAccounts = accountsData.length;
    const totalBalance = accountsData.reduce((sum, account) => sum + account.balance, 0);
    const averageBalance = totalBalance / totalAccounts;
    const activeAccounts = accountsData.filter(account => account.status === 'active').length;

    setStats({
      totalAccounts,
      totalBalance,
      averageBalance,
      activeAccounts
    });
  };

  const filterAndSortAccounts = () => {
    let filtered = accounts.filter(account =>
      account.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_id.toString().includes(searchTerm)
    );

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAccounts(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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

  const getBalanceColor = (balance) => {
    if (balance >= 10000) return 'text-success';
    if (balance >= 5000) return 'text-primary';
    return 'text-warning';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Account Dashboard</h1>
        <p>Manage and monitor all bank accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="stat-icon">
            <Users className="text-primary" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalAccounts}</h3>
            <p>Total Accounts</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="stat-icon">
            <DollarSign className="text-success" />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalBalance)}</h3>
            <p>Total Balance</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="stat-icon">
            <TrendingUp className="text-primary" />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.averageBalance)}</h3>
            <p>Average Balance</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <div className="stat-icon">
            <Activity className="text-success" />
          </div>
          <div className="stat-content">
            <h3>{stats.activeAccounts}</h3>
            <p>Active Accounts</p>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="dashboard-controls">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or account ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <Filter className="filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="account_id">Account ID</option>
            <option value="customer_name">Customer Name</option>
            <option value="balance">Balance</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-btn"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            <ArrowUpDown />
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="accounts-table-container">
        <table className="accounts-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('account_id')}>
                Account ID
                {sortBy === 'account_id' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('customer_name')}>
                Customer Name
                {sortBy === 'customer_name' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('balance')}>
                Balance
                {sortBy === 'balance' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Currency</th>
              <th onClick={() => handleSort('status')}>
                Status
                {sortBy === 'status' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account, index) => (
              <motion.tr
                key={account.account_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="account-row"
              >
                <td className="account-id">#{account.account_id}</td>
                <td className="customer-name">{account.customer_name}</td>
                <td className={`balance ${getBalanceColor(account.balance)}`}>
                  {formatCurrency(account.balance)}
                </td>
                <td className="currency">{account.currency}</td>
                <td>
                  <span className={`badge badge-${account.status === 'active' ? 'success' : 'warning'}`}>
                    {account.status}
                  </span>
                </td>
                <td className="actions">
                  <Link
                    to={`/account/${account.account_id}`}
                    className="btn btn-sm btn-primary"
                  >
                    <Eye size={16} />
                    View Details
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredAccounts.length === 0 && (
          <div className="no-results">
            <p>No accounts found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
