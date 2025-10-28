import { useState } from 'react';
import { Bell, Send, Megaphone, Users, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendLocalNotification } from '../lib/pushNotifications';

export default function AdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    image: '',
    url: '',
    target: 'all' // 'all', 'merchant_customers'
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Validação
      if (!form.title || !form.message) {
        alert('❌ Preencha título e mensagem');
        setLoading(false);
        return;
      }

      // NOTA: Este é um exemplo simplificado
      // Em produção, você deve:
      // 1. Salvar a notificação no banco (tabela notifications)
      // 2. Usar um serviço de push real (Firebase, OneSignal, etc)
      // 3. Enviar para todos os dispositivos registrados

      // Por enquanto, vamos enviar uma notificação local de teste
      const result = await sendLocalNotification({
        title: form.title,
        body: form.message,
        image: form.image || undefined,
        url: form.url || '/',
        tag: 'admin-promotion',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200]
      });

      if (result.success) {
        // Salvar registro no banco
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
            sent_by: 'admin' // TODO: pegar do auth
          });

        if (dbError) {
          console.error('Erro ao salvar notificação:', dbError);
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

        alert('✅ Notificação enviada com sucesso!\n\n⚠️ IMPORTANTE: Este é um teste local. Em produção, a notificação será enviada para todos os clientes registrados.');
      } else {
        alert('❌ Erro ao enviar notificação: ' + result.error);
      }

    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao enviar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Enviar Notificações Push
              </h1>
              <p className="text-gray-600">
                Envie promoções e avisos para seus clientes
              </p>
            </div>
          </div>
        </div>

        {/* Aviso de Teste */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">
                ⚠️ Modo de Teste
              </h3>
              <p className="text-sm text-yellow-800">
                Esta funcionalidade está em modo de teste e envia uma notificação local apenas para você.
                <br />
                Em produção, as notificações serão enviadas para todos os clientes registrados através de um serviço de push real (Firebase, OneSignal, etc).
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSendNotification} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título da Notificação *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: 🎁 Promoção Especial!"
              className="input-field"
              required
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.title.length}/50 caracteres
            </p>
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <p className="text-xs text-gray-500 mt-1">
              {form.message.length}/200 caracteres
            </p>
          </div>

          {/* URL da Imagem (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Imagem (opcional)
            </label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem-promocao.jpg"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Imagem será exibida na notificação (recomendado: 1200x600px)
            </p>
          </div>

          {/* Link de Destino (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link de Destino (opcional)
            </label>
            <input
              type="text"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="/customer/dashboard/SEU_TELEFONE"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Para onde o usuário será levado ao clicar na notificação
            </p>
          </div>

          {/* Público Alvo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Público Alvo
            </label>
            <select
              name="target"
              value={form.target}
              onChange={handleChange}
              className="input-field"
            >
              <option value="all">Todos os Clientes</option>
              <option value="merchant_customers">Clientes do Comerciante (em breve)</option>
            </select>
          </div>

          {/* Botão de Envio */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : success ? (
                <>
                  <Check className="w-5 h-5" />
                  Enviado!
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Notificação
                </>
              )}
            </button>
          </div>
        </form>

        {/* Exemplos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Exemplos de Promoções
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>🎉 Dobro de cashback neste final de semana!</li>
            <li>🔥 Queima de estoque com 30% de desconto + cashback</li>
            <li>🎁 Seu aniversário chegou! Ganhe 50% de cashback hoje</li>
            <li>⚡ Flash Sale: Compre agora e ganhe R$ 10 de cashback extra</li>
            <li>💰 Resgate seu cashback e ganhe 10% de bônus</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
