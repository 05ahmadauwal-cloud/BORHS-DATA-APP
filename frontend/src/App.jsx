import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import Pricing from './pages/public/Pricing';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Customer Pages
import Dashboard from './pages/customer/Dashboard';
import Wallet from './pages/customer/Wallet';
import DataPurchase from './pages/customer/DataPurchase';
import Airtime from './pages/customer/Airtime';
import Electricity from './pages/customer/Electricity';
import Cable from './pages/customer/Cable';
import Education from './pages/customer/Education';
import Referrals from './pages/customer/Referrals';
import Transactions from './pages/customer/Transactions';
import Profile from './pages/customer/Profile';
import BecomeAgent from './pages/customer/BecomeAgent';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import Downlines from './pages/agent/Downlines';
import CommissionHistory from './pages/agent/CommissionHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminServices from './pages/admin/AdminServices';
import AdminSettings from './pages/admin/AdminSettings';
import AdminKYC from './pages/admin/AdminKYC';
import AdminAgentApplications from './pages/admin/AdminAgentApplications';
import AdminCoupons from './pages/admin/AdminCoupons';

// Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

export default function App() {
  const { isAuthenticated, refreshUser, accessToken } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    if (accessToken) refreshUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Customer Dashboard */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/data" element={<DataPurchase />} />
          <Route path="/airtime" element={<Airtime />} />
          <Route path="/electricity" element={<Electricity />} />
          <Route path="/cable" element={<Cable />} />
          <Route path="/education" element={<Education />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/become-agent" element={<BecomeAgent />} />

          {/* Agent Routes */}
          <Route element={<RoleRoute roles={['agent', 'admin', 'super_admin']} />}>
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/agent/downlines" element={<Downlines />} />
            <Route path="/agent/commissions" element={<CommissionHistory />} />
          </Route>
        </Route>

        {/* Admin Panel */}
        <Route element={<ProtectedRoute><RoleRoute roles={['admin', 'super_admin']}><AdminLayout /></RoleRoute></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/kyc" element={<AdminKYC />} />
          <Route path="/admin/agent-applications" element={<AdminAgentApplications />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
