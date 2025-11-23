import { AlertCircle, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

/**
 * Componente de alerta para upgrade de plano
 * Mostra quando o usuário atinge limites ou tenta usar features bloqueadas
 */
export default function UpgradeAlert({ 
  type = 'limit', // 'limit' | 'feature'
  title,
  message,
  featureName,
  currentPlan,
  onClose 
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (onClose) onClose();
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              {type === 'limit' ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <TrendingUp className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {title || 'Upgrade Necessário'}
              </h3>
              {currentPlan && (
                <p className="text-sm text-white/80">
                  Plano atual: {currentPlan.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-white/90 mb-4 text-sm leading-relaxed">
          {message || 'Você atingiu o limite do seu plano atual. Faça upgrade para continuar crescendo!'}
        </p>

        {featureName && (
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <p className="text-xs text-white/80 mb-1">Recurso bloqueado:</p>
            <p className="text-sm font-semibold">{featureName}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to="/dashboard/planos"
            className="flex-1 bg-white text-purple-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-colors text-center text-sm"
          >
            Ver Planos
          </Link>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-white/20 hover:bg-white/30 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Agora Não
          </button>
        </div>
      </div>
    </div>
  );
}
