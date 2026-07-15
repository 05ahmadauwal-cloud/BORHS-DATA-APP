import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import useIdleLogout from './hooks/useIdleLogout';
import NativeAppLifecycle from './components/common/NativeAppLifecycle';

const PublicLayout = lazy(() => import('./components/layout/PublicLayout'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const Home = lazy(() => import('./pages/public/Home'));
const Pricing = lazy(() => import('./pages/public/Pricing'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/customer/Dashboard'));
const Wallet = lazy(() => import('./pages/customer/Wallet'));
const DataPurchase = lazy(() => import('./pages/customer/DataPurchase'));
const Airtime = lazy(() => import('./pages/customer/Airtime'));
const Electricity = lazy(() => import('./pages/customer/Electricity'));
const Cable = lazy(() => import('./pages/customer/Cable'));
const Education = lazy(() => import('./pages/customer/Education'));
const Referrals = lazy(() => import('./pages/customer/Referrals'));
const Transactions = lazy(() => import('./pages/customer/Transactions'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const BecomeAgent = lazy(() => import('./pages/customer/BecomeAgent'));
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'));
const Downlines = lazy(() => import('./pages/agent/Downlines'));
const CommissionHistory = lazy(() => import('./pages/agent/CommissionHistory'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminKYC = lazy(() => import('./pages/admin/AdminKYC'));
const AdminAgentApplications = lazy(() => import('./pages/admin/AdminAgentApplications'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));

// Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

export default function App() {
  const { user, isAuthenticated, refreshUser, accessToken } = useAuthStore();
  const { initTheme } = useThemeStore();
  useIdleLogout();
  const isNativeApp = Capacitor.isNativePlatform();
  const dashboardHome = ['admin', 'super_admin'].includes(user?.role)
    ? '/admin'
    : user?.role === 'agent' ? '/agent' : '/dashboard';

  useEffect(() => {
    initTheme();
    if (accessToken) refreshUser();
  }, []);

  return (
    <BrowserRouter>
      <NativeAppLifecycle />
      <Suspense fallback={(
        <div className="min-h-screen flex items-center justify-center bg-dark-950">
          <div className="flex items-center gap-3 text-sm font-semibold text-dark-300">
            <span className="h-5 w-5 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
            Loading…
          </div>
        </div>
      )}>
      <Routes>
        {/* Public */}
        {isNativeApp ? (
          <Route path="/" element={<Navigate to={isAuthenticated ? dashboardHome : '/login'} replace />} />
        ) : (
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          </Route>
        )}

        {/* Auth */}
        <Route path="/login" element={isAuthenticated ? <Navigate to={dashboardHome} replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={dashboardHome} replace /> : <Register />} />
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
          <Route path="/admin/notifications" element={<AdminNotifications />} />
        </Route>

        <Route path="*" element={<Navigate to={isNativeApp ? (isAuthenticated ? dashboardHome : '/login') : '/'} replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
