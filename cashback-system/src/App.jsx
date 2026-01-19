import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { initGTM, initMetaPixel } from './lib/tracking';

// Pages
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Cashback = lazy(() => import('./pages/Cashback'));
const Redemption = lazy(() => import('./pages/Redemption'));
const Customers = lazy(() => import('./pages/Customers'));
const Employees = lazy(() => import('./pages/Employees'));
const Reports = lazy(() => import('./pages/Reports'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Settings = lazy(() => import('./pages/Settings'));
const WhiteLabelSettings = lazy(() => import('./pages/WhiteLabelSettings'));
const CustomerCashback = lazy(() => import('./pages/CustomerCashback'));
const CustomerRedemption = lazy(() => import('./pages/CustomerRedemption'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const CustomerSignup = lazy(() => import('./pages/CustomerSignup'));
const CustomerLogin = lazy(() => import('./pages/CustomerLogin'));
const CustomerForgotPassword = lazy(() => import('./pages/CustomerForgotPassword'));
const CustomerResetPassword = lazy(() => import('./pages/CustomerResetPassword'));
const ForceUpdate = lazy(() => import('./pages/ForceUpdate'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));

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
      
      <Suspense fallback={<div style={{padding:'2rem',textAlign:'center'}}>Carregando...</div>}>
      <Routes>
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
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
