import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const FALLBACK_ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

/**
 * Hook para gerenciar OneSignal Web SDK
 * Inicializa OneSignal com o App ID do merchant e permite subscription
 */
export function useOneSignal(merchantId, customerPhone) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializar OneSignal quando merchant estiver disponível
  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    initializeOneSignal(merchantId);
  }, [merchantId]);

  /**
   * Inicializar OneSignal com App ID do merchant
   */
  const initializeOneSignal = async (merchantId) => {
    try {
      console.log('🔔 [OneSignal] Inicializando para merchant:', merchantId);

      // Buscar configuração OneSignal do merchant
      const { data: config, error } = await supabase
        .from('integration_configs')
        .select('app_id, is_active')
        .eq('merchant_id', merchantId)
        .eq('provider', 'onesignal')
        .eq('is_active', true)
        .single();

      const appId = config?.app_id || FALLBACK_ONESIGNAL_APP_ID;

      if (!appId) {
        console.log('⚠️ [OneSignal] Não configurado para este merchant e sem App ID global');
        setLoading(false);
        return;
      }

      if (config?.app_id) {
        console.log('✅ [OneSignal] Configuração encontrada no banco:', config.app_id);
      } else {
        console.log('ℹ️ [OneSignal] Usando App ID global do ambiente');
      }

      // Verificar se OneSignalDeferred está disponível
      if (!window.OneSignalDeferred) {
        console.warn('❌ [OneSignal] SDK não carregado');
        setLoading(false);
        return;
      }

      // Inicializar OneSignal
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true, // Para desenvolvimento
          notifyButton: {
            enable: false // Desabilitar botão padrão (usamos nosso próprio)
          },
          serviceWorkerParam: { scope: '/' },
          serviceWorkerPath: '/OneSignalSDKWorker.js'
        });

        console.log('✅ [OneSignal] Inicializado com sucesso!');
        setIsInitialized(true);

        // Verificar estado de subscription
        const isPushSubscribed = await OneSignal.User.PushSubscription.optedIn;
        setIsSubscribed(isPushSubscribed);

        if (isPushSubscribed) {
          const id = OneSignal.User.PushSubscription.id;
          setPlayerId(id);
          console.log('✅ [OneSignal] Já inscrito! Player ID:', id);
        }

        setLoading(false);
      });

    } catch (error) {
      console.error('❌ [OneSignal] Erro ao inicializar:', error);
      setLoading(false);
    }
  };

  /**
   * Solicitar permissão e inscrever usuário
   */
  const subscribe = async () => {
    if (!isInitialized || !window.OneSignalDeferred) {
      console.warn('⚠️ [OneSignal] Não inicializado');
      return { success: false, error: 'OneSignal não inicializado' };
    }

    try {
      console.log('🔔 [OneSignal] Solicitando permissão...');

      return await new Promise((resolve) => {
        window.OneSignalDeferred.push(async function(OneSignal) {
          try {
            // Definir External User ID (telefone do cliente)
            if (customerPhone) {
              try {
                await OneSignal.login(customerPhone);
                console.log('✅ [OneSignal] External User ID definido:', customerPhone);
              } catch (loginError) {
                // Erro 409 (conflito) é esperado se usuário já existe - pode ignorar
                console.log('ℹ️ [OneSignal] Login: usuário pode já existir (normal)');
              }
            }

            // Solicitar permissão de notificações
            const permission = await OneSignal.Notifications.requestPermission();
            
            if (permission) {
              // Aguardar subscription
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const id = OneSignal.User.PushSubscription.id;
              const token = OneSignal.User.PushSubscription.token;
              
              setIsSubscribed(true);
              setPlayerId(id);

              console.log('✅ [OneSignal] Inscrito com sucesso!', {
                playerId: id,
                token: token ? 'presente' : 'ausente',
                externalUserId: customerPhone
              });

              resolve({ 
                success: true, 
                playerId: id,
                externalUserId: customerPhone
              });
            } else {
              console.warn('⚠️ [OneSignal] Permissão negada');
              resolve({ 
                success: false, 
                error: 'Permissão negada pelo usuário' 
              });
            }
          } catch (error) {
            console.error('❌ [OneSignal] Erro ao inscrever:', error);
            const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
            resolve({ 
              success: false, 
              error: errorMessage
            });
          }
        });
      });

    } catch (error) {
      console.error('❌ [OneSignal] Erro geral:', error);
      const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Cancelar subscription
   */
  const unsubscribe = async () => {
    if (!window.OneSignalDeferred) return;

    return await new Promise((resolve) => {
      window.OneSignalDeferred.push(async function(OneSignal) {
        try {
          await OneSignal.User.PushSubscription.optOut();
          setIsSubscribed(false);
          setPlayerId(null);
          console.log('✅ [OneSignal] Desinscrição realizada');
          resolve({ success: true });
        } catch (error) {
          console.error('❌ [OneSignal] Erro ao desinscrever:', error);
          resolve({ success: false, error: error.message });
        }
      });
    });
  };

  return {
    isInitialized,
    isSubscribed,
    playerId,
    loading,
    subscribe,
    unsubscribe
  };
}
