import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { registerDevice, areNotificationsEnabled } from '../lib/pushNotifications';

export default function NotificationPermission({ customerPhone, onClose }) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar se já está habilitado
    setEnabled(areNotificationsEnabled());
    
    // Verificar se usuário já dispensou
    const wasDismissed = localStorage.getItem('notification-permission-dismissed');
    setDismissed(wasDismissed === 'true');
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    
    const result = await registerDevice(customerPhone);
    
    if (result.success) {
      setEnabled(true);
      alert('✅ Notificações habilitadas! Você receberá alertas de cashback.');
      if (onClose) onClose();
    } else {
      if (result.error === 'not_supported') {
        alert('❌ Seu navegador não suporta notificações.');
      } else if (result.error === 'permission_denied') {
        alert('❌ Você negou a permissão. Ative nas configurações do navegador.');
      } else {
        alert('❌ Erro ao habilitar notificações: ' + result.error);
      }
    }
    
    setLoading(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-permission-dismissed', 'true');
    setDismissed(true);
    if (onClose) onClose();
  };

  // Não mostrar se já habilitado ou se foi dispensado
  if (enabled || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-fade-in">
      {/* Botão fechar */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Conteúdo */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <Bell className="w-6 h-6 text-primary-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Ativar Notificações?
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Receba alertas instantâneos quando ganhar ou resgatar cashback!
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Habilitando...' : 'Ativar'}
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Agora Não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
