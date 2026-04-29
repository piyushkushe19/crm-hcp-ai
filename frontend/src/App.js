/**
 * App.js – root component with React Router and Redux Provider.
 * Protected routes redirect to login if no token.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './store';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogInteractionPage from './pages/LogInteractionPage';
import InteractionsPage from './pages/InteractionsPage';
import DemoPage from './pages/DemoPage';
import ToastContainer from './components/shared/Toast';

import './styles/global.css';

// Protected Route wrapper
function PrivateRoute({ children }) {
  const token = useSelector((s) => s.auth.token);
  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/log-interaction" element={<PrivateRoute><LogInteractionPage /></PrivateRoute>} />
        <Route path="/interactions" element={<PrivateRoute><InteractionsPage /></PrivateRoute>} />
        <Route path="/demo" element={<PrivateRoute><DemoPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
