import { useEffect, useState } from 'react';
import { X, Gift, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Componente de Notificação Popup
 * 
 * Tipos:
 * - cashback: Cashback recebido (verde)
 * - redemption: Resgate realizado (laranja)
 * - success: Sucesso genérico (azul)
 * - error: Erro (vermelho)
 */
export default function NotificationPopup({ 
  type = 'cashback',
  title,
  message,
  amount,
  duration = 5000,
  onClose,
  autoClose = true 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isEntering, setIsEntering] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoClose) return;

    // Barra de progresso
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    // Auto fechar após duration
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(closeTimer);
    };
  }, [duration, autoClose]);

  const handleClose = () => {
    setIsEntering(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  // Configurações por tipo
  const configs = {
    cashback: {
      icon: Gift,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
      amountColor: 'text-green-600',
      progressBg: 'bg-green-400'
    },
    redemption: {
      icon: TrendingUp,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      messageColor: 'text-orange-700',
      amountColor: 'text-orange-600',
      progressBg: 'bg-orange-400'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      amountColor: 'text-blue-600',
      progressBg: 'bg-blue-400'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      amountColor: 'text-red-600',
      progressBg: 'bg-red-400'
    }
  };

  const config = configs[type] || configs.cashback;
  const Icon = config.icon;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm w-full px-4 sm:px-0 transition-all duration-300 ease-out ${
        isEntering ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-lg shadow-2xl p-4 animate-fade-in`}>
        {/* Header com ícone e botão fechar */}
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className={`${config.iconBg} rounded-full p-2 flex-shrink-0 animate-bounce-small`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg ${config.titleColor} mb-1`}>
              {title}
            </h3>
            {message && (
              <p className={`text-sm ${config.messageColor} mb-2`}>
                {message}
              </p>
            )}
            {amount !== undefined && (
              <p className={`text-2xl font-bold ${config.amountColor}`}>
                {type === 'redemption' ? '-' : '+'}R$ {parseFloat(amount).toFixed(2)}
              </p>
            )}
          </div>

          {/* Botão fechar */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de progresso (se auto-close) */}
        {autoClose && (
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${config.progressBg} transition-all ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
