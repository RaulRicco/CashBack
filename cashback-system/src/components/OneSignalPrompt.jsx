import { useState, useEffect } from 'react';
import { Bell, X, Loader } from 'lucide-react';
import { useOneSignal } from '../hooks/useOneSignal';
import toast from 'react-hot-toast';

export default function OneSignalPrompt({ merchantId, customerPhone, onClose }) {
  const { isInitialized, isSubscribed, loading, subscribe } = useOneSignal(merchantId, customerPhone);
  const [subscribing, setSubscribing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar se usuário já dispensou
    const wasDismissed = localStorage.getItem(`onesignal-prompt-dismissed-${customerPhone}`);
    setDismissed(wasDismissed === 'true');
  }, [customerPhone]);

  const handleEnable = async () => {
    setSubscribing(true);
    
    const result = await subscribe();
    
    if (result.success) {
      toast.success('✅ Notificações habilitadas! Você receberá alertas de cashback.', {
        duration: 5000,
        icon: '🔔'
      });
      console.log('✅ Subscription completa:', result);
      if (onClose) onClose();
    } else {
      if (result.error.includes('Permission')) {
        toast.error('❌ Você negou a permissão. Ative nas configurações do navegador.', {
          duration: 6000
        });
      } else {
        toast.error(`❌ Erro: ${result.error}`, {
          duration: 6000
        });
      }
    }
    
    setSubscribing(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(`onesignal-prompt-dismissed-${customerPhone}`, 'true');
    setDismissed(true);
    if (onClose) onClose();
  };

  // Não mostrar se:
  // - OneSignal não está inicializado
  // - Já está inscrito
  // - Foi dispensado
  // - Ainda carregando
  if (loading || !isInitialized || isSubscribed || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-fade-in">
      {/* Botão fechar */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Conteúdo */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
          <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            🔔 Ativar Notificações Push?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Receba alertas instantâneos quando ganhar ou resgatar cashback! Funciona mesmo com o app fechado.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              disabled={subscribing}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {subscribing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Habilitando...
                </>
              ) : (
                'Ativar'
              )}
            </button>
            <button
              onClick={handleDismiss}
              disabled={subscribing}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              Agora Não
            </button>
          </div>
          
          {/* Info adicional */}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Você pode desativar a qualquer momento nas configurações do navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
