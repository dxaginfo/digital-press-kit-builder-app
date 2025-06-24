import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PressKitListPage from './pages/pressKit/PressKitListPage';
import PressKitEditorPage from './pages/pressKit/PressKitEditorPage';
import PressKitViewPage from './pages/pressKit/PressKitViewPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          
          {/* Auth Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="press-kits" element={<PressKitListPage />} />
            <Route path="press-kits/create" element={<PressKitEditorPage />} />
            <Route path="press-kits/edit/:id" element={<PressKitEditorPage />} />
          </Route>
          
          {/* Public Press Kit View */}
          <Route path="press-kit/:slug" element={<PressKitViewPage />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;