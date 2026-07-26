import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const META_APP_ID = import.meta.env.VITE_META_APP_ID;
const META_CONFIG_ID = import.meta.env.VITE_META_WHATSAPP_CONFIG_ID;

function loadFacebookSdk() {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: META_APP_ID,
        autoLogAppEvents: true,
        xfbml: false,
        version: 'v21.0',
      });
      resolve(window.FB);
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/pt_BR/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function WhatsAppConnectButton({ merchantId, onConnected }) {
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    function handleMessage(event) {
      if (event.origin !== 'https://www.facebook.com') return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'CANCEL') {
          setConnecting(false);
          toast.error('Conexão com WhatsApp cancelada');
        }
      } catch {
        // Mensagens não relacionadas ao Embedded Signup são ignoradas
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    if (!META_APP_ID || !META_CONFIG_ID) {
      toast.error('Integração com WhatsApp ainda não configurada pelo administrador do sistema');
      return;
    }

    setConnecting(true);
    try {
      const FB = await loadFacebookSdk();

      FB.login(
        async (response) => {
          const code = response.authResponse?.code;
          if (!code) {
            setConnecting(false);
            toast.error('Não foi possível concluir a conexão com o WhatsApp');
            return;
          }

          try {
            const { data, error } = await supabase.functions.invoke('whatsapp-embedded-signup', {
              body: { code, merchantId },
            });

            if (error || !data?.success) {
              throw new Error(data?.error || error?.message || 'Erro ao concluir conexão');
            }

            toast.success('✅ WhatsApp conectado com sucesso!');
            onConnected?.(data);
          } catch (invokeError) {
            console.error('Erro ao trocar code por token:', invokeError);
            toast.error(`Erro ao conectar WhatsApp: ${invokeError.message}`);
          } finally {
            setConnecting(false);
          }
        },
        {
          config_id: META_CONFIG_ID,
          response_type: 'code',
          override_default_response_type: true,
          extras: { featureType: 'whatsapp_business_app_onboarding' },
        }
      );
    } catch (sdkError) {
      console.error('Erro ao carregar SDK do Facebook:', sdkError);
      toast.error('Erro ao carregar conexão com a Meta. Tente novamente.');
      setConnecting(false);
    }
  };

  return (
    <button onClick={handleConnect} disabled={connecting} className="btn-primary flex items-center gap-2">
      {connecting ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          Conectando...
        </>
      ) : (
        'Conectar WhatsApp Business'
      )}
    </button>
  );
}
