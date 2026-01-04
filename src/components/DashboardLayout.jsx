import { useState, useEffect } from 'react';
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
  Palette,
  Moon,
  Sun,
  Store
} from 'lucide-react';
import { BRAND_CONFIG, getLogo, getBrandName } from '../config/branding';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { merchant, employee, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Load dark mode preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
    { name: 'Meu CashBack', href: '/whitelabel', icon: Palette },
    { name: 'Assinatura', href: '/dashboard/assinatura', icon: Store },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
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
          fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-950 shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <img 
                src={getLogo('icon')}
                alt={getBrandName()} 
                className="object-contain w-10 h-10"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{getBrandName(true)}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Merchant Info */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black">
            <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide font-semibold mb-1">
              Estabelecimento
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {merchant?.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
              {employee?.name}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto dark:bg-gray-950">
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
                      ? 'bg-primary-50 dark:bg-primary-500 text-primary-700 dark:text-black font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
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
        <header className="bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100"
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
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{getBrandName(true)}</span>
              </div>
            </div>
            
            {/* Right side - Dark Mode + Merchant Logo/Name */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              {/* Merchant Logo and Name - TOP RIGHT */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{merchant?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Estabelecimento</p>
                </div>
                
                {/* Merchant Logo in Green Circle */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-green-100 dark:bg-green-500 shadow-md ring-2 ring-green-200 dark:ring-green-400 flex items-center justify-center">
                  {merchant?.logo_url ? (
                    <img 
                      src={merchant.logo_url} 
                      alt={merchant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src="https://www.genspark.ai/api/files/s/4JnvS9YI"
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 dark:bg-black min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
