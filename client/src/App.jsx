import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import AccountDetail from './pages/AccountDetail';
import AsOfQuery from './pages/AsOfQuery';
import CreateTransaction from './pages/CreateTransaction';
import Rollback from './pages/Rollback';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="account/:id" element={<AccountDetail />} />
        <Route path="as-of" element={<AsOfQuery />} />
        <Route path="transaction" element={<CreateTransaction />} />
        <Route path="rollback" element={<Rollback />} />
      </Route>
    </Routes>
  );
}

export default App;
