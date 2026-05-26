import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AuthCallbackPage from './pages/AuthCallbackPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoadBoardPage from './pages/LoadBoardPage.jsx';
import LoadDetailsPage from './pages/LoadDetailsPage.jsx';
import TruckBoardPage from './pages/TruckBoardPage.jsx';
import PostLoadPage from './pages/PostLoadPage.jsx';
import DemoPage from './pages/DemoPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ManageLoads from './pages/admin/ManageLoads.jsx';
import ManageTrucks from './pages/admin/ManageTrucks.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManageSocialMedia from './pages/admin/ManageSocialMedia.jsx';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/oauth/callback" element={<AuthCallbackPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/load-board" element={<LoadBoardPage />} />
      <Route path="/load/:id" element={<LoadDetailsPage />} />
      <Route path="/truck-board" element={<TruckBoardPage />} />
      <Route path="/post-load" element={<PostLoadPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Admin Routes */}
      <Route path="/admin/manage-loads" element={<ManageLoads />} />
      <Route path="/admin/manage-trucks" element={<ManageTrucks />} />
      <Route path="/admin/manage-users" element={<ManageUsers />} />
      <Route path="/admin/manage-social-media" element={<ManageSocialMedia />} />
    </Routes>
  );
}

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // Landing Page (Route "/" for unauthenticated users) has its own Navbar/Footer.
  // We hide the global ones to prevent duplication.
  const isLandingPage = location.pathname === '/' && !user;

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!isLandingPage && <Navbar />}
      <main className="flex-grow">
        <AppRoutes />
      </main>
      {!isLandingPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
