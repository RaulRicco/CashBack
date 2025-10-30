import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Users,
  Gift,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  UserPlus,
  QrCode,
  Mail,
  Bell,
  Palette
} from 'lucide-react';
import { BRAND_CONFIG, getLogo, getBrandName } from '../config/branding';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { merchant, employee, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cashback', href: '/cashback', icon: Gift },
    { name: 'Resgate', href: '/redemption', icon: QrCode },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Funcionários', href: '/employees', icon: UserPlus },
    { name: 'Relatórios', href: '/reports', icon: TrendingUp },
    { name: 'Integrações', href: '/integrations', icon: Mail },
    { name: 'Notificações', href: '/notifications', icon: Bell },
    { name: 'Meu CashBack', href: '/whitelabel', icon: Palette },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img 
                src={getLogo('icon')}
                alt={getBrandName()} 
                className="object-contain w-10 h-10"
              />
              <span className="text-xl font-bold text-gray-900">{getBrandName(true)}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Merchant Info */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
              Estabelecimento
            </p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {merchant?.name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {employee?.name}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${active
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Logo Mobile */}
              <div className="flex items-center gap-2 lg:hidden">
                <img 
                  src={getLogo('icon')}
                  alt={getBrandName()} 
                  className="object-contain w-8 h-8"
                />
                <span className="text-lg font-bold text-gray-900">{getBrandName(true)}</span>
              </div>
            </div>
            
            <div className="flex-1 lg:flex-none"></div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{employee?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{employee?.role}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold">
                  {employee?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
