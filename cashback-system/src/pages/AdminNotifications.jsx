import { useState, useEffect } from 'react';
import { Bell, Send, Megaphone, Users, Check, Sparkles, TrendingUp, Gift, Zap, AlertCircle, X, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendLocalNotification, areNotificationsEnabled } from '../lib/pushNotifications';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showEnablePrompt, setShowEnablePrompt] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    image: '',
    url: '',
    target: 'all'
  });

  useEffect(() => {
    // Verificar se notificações estão habilitadas
    const enabled = areNotificationsEnabled();
    setNotificationsEnabled(enabled);
    
    if (!enabled) {
      // Mostrar prompt após 1 segundo
      setTimeout(() => {
        setShowEnablePrompt(true);
      }, 1000);
    }
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        setShowEnablePrompt(false);
        toast.success('✅ Notificações habilitadas com sucesso!');
        
        // Enviar notificação de teste
        await sendLocalNotification({
          title: '🎉 Notificações Ativadas!',
          body: 'Agora você pode enviar promoções para seus clientes!',
          tag: 'welcome'
        });
      } else {
        toast.error('❌ Você negou a permissão. Ative nas configurações do navegador.');
      }
    } catch (error) {
      console.error('Erro ao habilitar notificações:', error);
      toast.error('❌ Erro ao habilitar notificações');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    // Verificar se notificações estão habilitadas
    if (!notificationsEnabled) {
      toast.error('❌ Você precisa habilitar as notificações primeiro!');
      setShowEnablePrompt(true);
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      // Validação
      if (!form.title || !form.message) {
        toast.error('❌ Preencha título e mensagem');
        setLoading(false);
        return;
      }

      console.log('📤 Enviando notificação...', form);

      // Enviar notificação local com timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Notificação demorou mais de 5 segundos')), 5000)
      );

      const notificationPromise = sendLocalNotification({
        title: form.title,
        body: form.message,
        image: form.image || undefined,
        url: form.url || '/',
        tag: 'admin-promotion',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200]
      });

      const result = await Promise.race([notificationPromise, timeoutPromise]);

      console.log('📬 Resultado:', result);

      if (result.success) {
        console.log('✅ Notificação enviada com sucesso, salvando no banco...');
        
        // Salvar registro no banco (não bloquear se falhar)
        try {
          const { error: dbError } = await supabase
            .from('notifications')
            .insert({
              type: 'promotion',
              title: form.title,
              message: form.message,
              image: form.image || null,
              url: form.url || null,
              target: form.target,
              sent_at: new Date().toISOString(),
              sent_by: 'admin'
            });

          if (dbError) {
            console.error('⚠️ Erro ao salvar notificação no banco:', dbError);
            // Não falhar por causa disso
          } else {
            console.log('✅ Notificação salva no banco');
          }
        } catch (dbException) {
          console.error('⚠️ Exceção ao salvar no banco:', dbException);
          // Não falhar por causa disso
        }

        setSuccess(true);
        
        // Limpar formulário
        setForm({
          title: '',
          message: '',
          image: '',
          url: '',
          target: 'all'
        });

        toast.success('✅ Notificação enviada com sucesso!', {
          duration: 4000,
          icon: '🎉'
        });
        
        // Resetar success após 3 segundos
        setTimeout(() => setSuccess(false), 3000);
      } else {
        console.error('❌ Erro ao enviar:', result.error);
        
        let errorMsg = 'Erro desconhecido';
        if (result.error === 'not_enabled') {
          errorMsg = 'Notificações não estão habilitadas';
        } else if (result.error.includes('Timeout')) {
          errorMsg = 'Tempo esgotado. Verifique o console (F12)';
        } else {
          errorMsg = result.error;
        }
        
        toast.error('❌ ' + errorMsg, {
          duration: 5000
        });
      }

    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error('❌ Erro ao enviar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickTemplates = [
    {
      icon: '🎉',
      title: 'Dobro de Cashback',
      template: {
        title: '🎉 Dobro de Cashback!',
        message: 'Ganhe o dobro de cashback em todas as compras neste final de semana!'
      }
    },
    {
      icon: '🔥',
      title: 'Queima de Estoque',
      template: {
        title: '🔥 Queima de Estoque!',
        message: 'Produtos com até 50% OFF + cashback. Aproveite!'
      }
    },
    {
      icon: '⚡',
      title: 'Flash Sale',
      template: {
        title: '⚡ Flash Sale!',
        message: 'Compre agora e ganhe R$ 10 de cashback extra!'
      }
    },
    {
      icon: '🎁',
      title: 'Aniversário',
      template: {
        title: '🎁 Parabéns!',
        message: 'É seu aniversário! Ganhe 50% de cashback hoje!'
      }
    }
  ];

  const useTemplate = (template) => {
    setForm({
      ...form,
      title: template.title,
      message: template.message
    });
    toast.success('✅ Template aplicado!');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Prompt para Habilitar Notificações */}
        {showEnablePrompt && !notificationsEnabled && (
          <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 text-white animate-fade-in">
            <button
              onClick={() => setShowEnablePrompt(false)}
              className="float-right text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  Habilite as Notificações Primeiro!
                </h3>
                <p className="text-white/90 mb-4">
                  Para enviar promoções aos clientes, você precisa ativar as notificações no seu navegador.
                </p>
                <button
                  onClick={handleEnableNotifications}
                  className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  🔔 Ativar Notificações Agora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Moderno */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-xl p-8 mb-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Megaphone className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Notificações Push
              </h1>
              <p className="text-primary-100">
                Envie promoções e avisos direto para seus clientes
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-4 py-2 inline-flex">
            {notificationsEnabled ? (
              <>
                <Check className="w-4 h-4 text-green-300" />
                <span className="text-sm font-medium">Notificações Ativas</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-orange-300" />
                <span className="text-sm font-medium">Notificações Desativadas</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Templates Rápidos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Templates Rápidos
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {quickTemplates.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => useTemplate(item.template)}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSendNotification} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Criar Notificação
              </h2>

              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ex: 🎁 Promoção Especial!"
                  className="input-field text-lg"
                  required
                  maxLength={50}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Use emojis para chamar atenção
                  </p>
                  <p className="text-xs text-gray-500">
                    {form.title.length}/50
                  </p>
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Ex: Ganhe 20% de cashback em todas as compras hoje!"
                  className="input-field"
                  rows={4}
                  required
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Seja claro e direto
                  </p>
                  <p className="text-xs text-gray-500">
                    {form.message.length}/200
                  </p>
                </div>
              </div>

              {/* Campos Opcionais (Colapsável) */}
              <details className="border border-gray-200 rounded-lg p-4">
                <summary className="font-medium text-gray-700 cursor-pointer">
                  Opções Avançadas (opcional)
                </summary>
                <div className="mt-4 space-y-4">
                  {/* URL da Imagem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL da Imagem
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={form.image}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/promo.jpg"
                      className="input-field"
                    />
                  </div>

                  {/* Link de Destino */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link de Destino
                    </label>
                    <input
                      type="text"
                      name="url"
                      value={form.url}
                      onChange={handleChange}
                      placeholder="/"
                      className="input-field"
                    />
                  </div>
                </div>
              </details>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={loading || !notificationsEnabled}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : success ? (
                  <>
                    <Check className="w-5 h-5" />
                    Enviado com Sucesso!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Notificação Push
                  </>
                )}
              </button>

              {!notificationsEnabled && (
                <p className="text-center text-sm text-orange-600 font-medium">
                  ⚠️ Habilite as notificações acima para enviar
                </p>
              )}
            </form>
          </div>

          {/* Coluna Direita - Dicas e Exemplos */}
          <div className="space-y-6">
            {/* Preview */}
            {(form.title || form.message) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </h3>
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {form.title || 'Título da notificação'}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {form.message || 'Mensagem da notificação'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        localcashback.com.br
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dicas */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Dicas para Melhores Resultados
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Use emojis para chamar atenção</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Seja breve e direto ao ponto</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Crie senso de urgência</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Mostre o benefício claro</span>
                </li>
              </ul>
            </div>

            {/* Exemplos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-600" />
                Exemplos de Sucesso
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>🎁 Aniversário! 50% cashback hoje</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>⚡ 2h restantes: R$ 10 extra</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>🔥 Dobro de cashback no fim de semana</span>
                </li>
              </ul>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Modo de Teste:</strong> A notificação será enviada localmente apenas para você. Em produção, será enviada para todos os clientes registrados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
