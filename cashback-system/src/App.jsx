import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { initGTM, initMetaPixel } from './lib/tracking';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Cashback from './pages/Cashback';
import Redemption from './pages/Redemption';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import WhiteLabelSettings from './pages/WhiteLabelSettings';
import CustomerCashback from './pages/CustomerCashback';
import CustomerRedemption from './pages/CustomerRedemption';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerSignup from './pages/CustomerSignup';
import CustomerLogin from './pages/CustomerLogin';
import CustomerForgotPassword from './pages/CustomerForgotPassword';
import CustomerResetPassword from './pages/CustomerResetPassword';
import ForceUpdate from './pages/ForceUpdate';
import AdminNotifications from './pages/AdminNotifications';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SubscriptionManagement from './pages/SubscriptionManagement';

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  useEffect(() => {
    // Inicializar Google Tag Manager
    const gtmId = import.meta.env.VITE_GTM_ID;
    if (gtmId) {
      initGTM(gtmId);
    }

    // Inicializar Meta Pixel
    const metaPixelId = import.meta.env.VITE_META_PIXEL_ID;
    if (metaPixelId) {
      initMetaPixel(metaPixelId);
    }

    // Check auth on mount
    const checkAuth = useAuthStore.getState().checkAuth;
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Home = Signup direto (Trial de 14 dias) */}
        <Route path="/" element={<Signup />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup/:slug" element={<CustomerSignup />} />
        <Route path="/force-update" element={<ForceUpdate />} />
        
        {/* Customer Public Routes (QR Code scans) */}
        <Route path="/customer/cashback/:token/parabens" element={<CustomerCashback />} />
        <Route path="/customer/cashback/:token" element={<CustomerCashback />} />
        <Route path="/customer/redemption/:token" element={<CustomerRedemption />} />
        <Route path="/customer/dashboard/:phone" element={<CustomerDashboard />} />
        <Route path="/customer/login/:slug" element={<CustomerLogin />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/forgot-password/:phone" element={<CustomerForgotPassword />} />
        <Route path="/customer/forgot-password" element={<CustomerForgotPassword />} />
        <Route path="/customer/reset-password" element={<CustomerResetPassword />} />
        
        {/* Protected Routes (Merchant/Employee Dashboard) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cashback" 
          element={
            <ProtectedRoute>
              <Cashback />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/redemption" 
          element={
            <ProtectedRoute>
              <Redemption />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employees" 
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/integrations" 
          element={
            <ProtectedRoute>
              <Integrations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <AdminNotifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/whitelabel" 
          element={
            <ProtectedRoute>
              <WhiteLabelSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/planos" 
          element={
            <ProtectedRoute>
              <SubscriptionPlans />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/assinatura" 
          element={
            <ProtectedRoute>
              <SubscriptionManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
