import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Upload, Palette, Save, RefreshCw, Lock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubscription } from '../hooks/useSubscription';

export default function WhiteLabelSettings() {
  const { merchant: authMerchant } = useAuthStore();
  const { checkFeature, currentPlan } = useSubscription();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [settings, setSettings] = useState({
    logo_url: '',
    primary_color: '#10b981',
    secondary_color: '#059669',
    accent_color: '#34d399',
    cashback_percentage: 5.00,
    business_name: '',
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadMerchant();
  }, []);

  async function loadMerchant() {
    try {
      if (!authMerchant) {
        toast.error('Usuário não autenticado');
        return;
      }

      console.log('Merchant do auth:', authMerchant);

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', authMerchant.id)
        .single();

      if (merchantError) {
        console.error('Erro ao buscar merchant:', merchantError);
        throw merchantError;
      }

      console.log('Merchant carregado:', merchantData);
      setMerchant(merchantData);
      
      setSettings({
        logo_url: merchantData.logo_url || '',
        primary_color: merchantData.primary_color || '#10b981',
        secondary_color: merchantData.secondary_color || '#059669',
        accent_color: merchantData.accent_color || '#34d399',
        cashback_percentage: merchantData.cashback_percentage || 5.00,
        business_name: merchantData.business_name || '',
        name: merchantData.name || '',
        email: merchantData.email || '',
        phone: merchantData.phone || ''
      });
    } catch (error) {
      console.error('Erro ao carregar merchant:', error);
      toast.error('Erro ao carregar dados do estabelecimento');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB');
      return;
    }

    setUploading(true);

    try {
      console.log('Iniciando upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Verificar merchant autenticado
      if (!merchant || !merchant.id) {
        console.error('Merchant não encontrado!');
        toast.error('Você precisa estar logado para fazer upload');
        return;
      }
      console.log('Merchant autenticado:', merchant.id);

      // Nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${merchant.id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      console.log('Upload path:', filePath);

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('merchant-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload bem-sucedido:', uploadData);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('merchant-assets')
        .getPublicUrl(filePath);

      console.log('URL pública:', publicUrl);

      // Atualizar estado local
      setSettings({ ...settings, logo_url: publicUrl });

      toast.success('Logo carregada com sucesso! Clique em Salvar para confirmar.');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(`Erro ao fazer upload da logo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!merchant) return;

    setSaving(true);

    try {
      console.log('Salvando configurações:', settings);

      const { error } = await supabase
        .from('merchants')
        .update({
          logo_url: settings.logo_url,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          accent_color: settings.accent_color,
          cashback_percentage: parseFloat(settings.cashback_percentage),
          business_name: settings.business_name,
          name: settings.name,
          email: settings.email,
          phone: settings.phone
        })
        .eq('id', merchant.id);

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
      
      // Recarregar página para aplicar mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  }

  // Verificar acesso à funcionalidade
  const hasWhitelabelAccess = checkFeature('whitelabel');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Se não tem acesso, mostrar tela de upgrade
  if (!hasWhitelabelAccess) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-12 overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-sm bg-white/40"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Whitelabel & Domínio Próprio
              </h1>
              
              <p className="text-xl text-gray-700 mb-2 max-w-2xl mx-auto leading-relaxed">
                Personalize completamente o sistema com sua marca e tenha seu próprio domínio.
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-xl mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Com Whitelabel você pode:</h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">Personalizar cores da sua marca</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">Adicionar sua logo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">Usar seu próprio domínio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">Sistema totalmente sob sua marca</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 text-lg text-gray-600 mb-8">
                <span className="font-semibold">Seu plano atual:</span>
                <span className="px-4 py-2 bg-white rounded-full border-2 border-gray-300 font-bold">
                  {currentPlan?.name || 'Starter'}
                </span>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>Disponível a partir do plano Business</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Tenha seu sistema completamente personalizado com sua marca
                </p>
              </div>
              
              <Link
                to="/dashboard/planos"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl"
              >
                <TrendingUp className="w-6 h-6" />
                Fazer Upgrade Agora
              </Link>
              
              <p className="text-sm text-gray-500 mt-6">
                Plano Business: <strong>R$ 297/mês</strong> | Plano Premium: <strong>R$ 497/mês</strong>
              </p>
            </div>
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Palette className="h-7 w-7 text-primary-600" />
              Meu CashBack
            </h1>
            <p className="text-gray-600 mt-1">
              Personalize a identidade visual e configurações do seu estabelecimento
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Salvar Configurações
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações do Negócio */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Negócio
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Estabelecimento
                </label>
                <input
                  type="text"
                  value={settings.business_name}
                  onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Nome da sua loja"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Responsável
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="contato@sualoja.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary-600" />
              Logo do Estabelecimento
            </h2>
            <div className="space-y-4">
              {/* Preview da Logo */}
              {settings.logo_url && (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                  <img
                    src={settings.logo_url}
                    alt="Logo"
                    className="max-h-32 object-contain"
                    onError={(e) => {
                      console.log('❌ Erro ao carregar logo:', e.target.src);
                      console.log('Detalhes do erro:', e);
                      // Ocultar imagem quebrada
                      e.target.style.display = 'none';
                      toast.error('Erro ao carregar logo. Verifique as permissões do Storage no Supabase.');
                    }}
                  />
                </div>
              )}
              
              {/* Upload Area - Toda área clicável */}
              <label 
                htmlFor="logo-upload" 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary-400 transition-colors bg-gray-50 cursor-pointer block"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary-600" />
                  </div>
                  
                  <div className="text-center">
                    <span className="text-base font-semibold text-primary-600 hover:text-primary-700 transition-colors block">
                      {settings.logo_url ? 'Alterar Logo' : 'Selecionar Logo'}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      Recomendado: PNG ou JPG, máximo 2MB, fundo transparente
                    </p>
                  </div>
                </div>
                
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              
              {/* Status do Upload */}
              {uploading && (
                <div className="flex items-center justify-center gap-2 text-primary-600 bg-primary-50 py-3 px-4 rounded-lg">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">Fazendo upload...</span>
                </div>
              )}
            </div>
          </div>

          {/* Cores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cores do Sistema
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Primária
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="#10b981"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Secundária
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="#059669"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Destaque
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accent_color}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="#34d399"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview de Cores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Preview das Cores
            </h2>
            <div className="space-y-3">
              <button
                style={{ backgroundColor: settings.primary_color }}
                className="w-full py-2 px-4 text-white font-medium rounded-lg"
              >
                Botão com Cor Primária
              </button>
              <button
                style={{ backgroundColor: settings.secondary_color }}
                className="w-full py-2 px-4 text-white font-medium rounded-lg"
              >
                Botão com Cor Secundária
              </button>
              <button
                style={{ backgroundColor: settings.accent_color }}
                className="w-full py-2 px-4 text-white font-medium rounded-lg"
              >
                Botão com Cor de Destaque
              </button>
            </div>
          </div>

          {/* Cashback */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Configuração de Cashback
            </h2>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentagem de Cashback (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.cashback_percentage}
                onChange={(e) => setSettings({ ...settings, cashback_percentage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Define quanto % será devolvido aos clientes em cada compra
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
