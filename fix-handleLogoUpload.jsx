// ========================================
// 🔧 SUBSTITUA A FUNÇÃO handleLogoUpload
// ========================================
// No arquivo: /var/www/cashback/cashback-system/src/pages/WhiteLabelSettings.jsx
// Procure a função handleLogoUpload e SUBSTITUA por esta versão corrigida:

const handleLogoUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    toast.error('Nenhum arquivo selecionado');
    return;
  }

  // VALIDAÇÕES DETALHADAS
  console.log('🔍 DIAGNÓSTICO - Arquivo selecionado:');
  console.log('  Nome:', file.name);
  console.log('  Tipo:', file.type);
  console.log('  Tamanho:', file.size, 'bytes');
  console.log('  Merchant ID:', merchant?.id);

  // Validar tipo de arquivo
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  if (!file.type || !allowedTypes.includes(file.type.toLowerCase())) {
    toast.error(`Tipo de arquivo inválido: ${file.type}. Use PNG, JPG, GIF ou WEBP.`);
    console.error('❌ Tipo de arquivo não permitido:', file.type);
    return;
  }

  // Validar tamanho (5MB máximo)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.error('Arquivo muito grande! Máximo: 5MB');
    console.error('❌ Arquivo muito grande:', file.size, 'bytes');
    return;
  }

  // Validar se merchant existe
  if (!merchant || !merchant.id) {
    toast.error('Erro: Dados do estabelecimento não encontrados. Faça login novamente.');
    console.error('❌ Merchant não encontrado:', merchant);
    return;
  }

  setUploadingLogo(true);

  try {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${merchant.id}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    console.log('📤 Iniciando upload...');
    console.log('  Path:', filePath);
    console.log('  Bucket: merchant-assets');

    // FAZER UPLOAD
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('merchant-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: true
      });

    console.log('📥 Resultado do upload:');
    console.log('  Data:', uploadData);
    console.log('  Error:', uploadError);

    if (uploadError) {
      console.error('❌ ERRO NO UPLOAD:', uploadError);
      throw uploadError;
    }

    if (!uploadData || !uploadData.path) {
      console.error('❌ Upload retornou sucesso mas sem path:', uploadData);
      throw new Error('Upload falhou: path não retornado');
    }

    // GERAR URL PÚBLICA
    const { data: publicUrlData } = supabase.storage
      .from('merchant-assets')
      .getPublicUrl(uploadData.path);

    const publicUrl = publicUrlData?.publicUrl;

    console.log('🔗 URL Pública gerada:', publicUrl);

    if (!publicUrl) {
      console.error('❌ Falha ao gerar URL pública:', publicUrlData);
      throw new Error('Falha ao gerar URL pública');
    }

    // TESTAR SE A URL É ACESSÍVEL
    console.log('🧪 Testando se a URL é acessível...');
    try {
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      console.log('  Status do teste:', testResponse.status);
      console.log('  Headers:', Object.fromEntries(testResponse.headers.entries()));
      
      if (!testResponse.ok) {
        console.error('❌ URL não acessível! Status:', testResponse.status);
        if (testResponse.status === 403) {
          throw new Error('Erro 403: Políticas de Storage não configuradas. Execute o SQL de correção!');
        } else if (testResponse.status === 404) {
          throw new Error('Erro 404: Arquivo não encontrado após upload. Tente novamente.');
        }
      } else {
        console.log('✅ URL acessível! Arquivo carregado com sucesso.');
      }
    } catch (fetchError) {
      console.error('❌ Erro ao testar URL:', fetchError);
      throw new Error(`URL não acessível: ${fetchError.message}`);
    }

    // ATUALIZAR NO BANCO DE DADOS
    console.log('💾 Atualizando logo_url no banco...');
    const { error: updateError } = await supabase
      .from('merchants')
      .update({ 
        logo_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', merchant.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar banco:', updateError);
      throw updateError;
    }

    console.log('✅ Logo atualizada no banco!');

    // ATUALIZAR ESTADO LOCAL
    setMerchant({ ...merchant, logo_url: publicUrl });
    setHasChanges(true);

    toast.success('Logo enviada com sucesso!');
    console.log('🎉 PROCESSO COMPLETO!');

  } catch (error) {
    console.error('💥 ERRO FATAL:', error);
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
    toast.error(error.message || 'Erro ao enviar logo. Verifique o console.');
  } finally {
    setUploadingLogo(false);
  }
};


// ========================================
// 🖼️ SUBSTITUA O COMPONENTE DE EXIBIÇÃO DA LOGO
// ========================================
// Procure onde tem a tag <img> que exibe a logo e substitua por:

{merchant?.logo_url && (
  <div className="mt-4 relative">
    <img
      src={merchant.logo_url}
      alt="Logo atual"
      className="h-32 w-32 object-contain rounded-lg border border-gray-300"
      onLoad={(e) => {
        console.log('✅ Logo carregada com sucesso!');
        console.log('  URL:', e.target.src);
        console.log('  Dimensões:', e.target.naturalWidth, 'x', e.target.naturalHeight);
      }}
      onError={(e) => {
        console.error('❌ ERRO AO CARREGAR LOGO:');
        console.error('  URL:', e.target.src);
        console.error('  Erro:', e);
        
        // DIAGNÓSTICO DETALHADO
        fetch(e.target.src, { method: 'HEAD' })
          .then(res => {
            console.log('🔍 Teste de acesso:');
            console.log('  Status:', res.status);
            console.log('  Status Text:', res.statusText);
            console.log('  Headers:', Object.fromEntries(res.headers.entries()));
            
            if (res.status === 403) {
              toast.error('Erro 403: Configure as políticas de Storage! Execute o SQL de correção.');
            } else if (res.status === 404) {
              toast.error('Erro 404: Arquivo não encontrado. Faça upload novamente.');
            } else {
              toast.error(`Erro ${res.status} ao carregar logo. Verifique o console.`);
            }
          })
          .catch(err => {
            console.error('❌ Fetch test failed:', err);
            toast.error('Erro de rede ao carregar logo. Verifique sua conexão.');
          });
      }}
    />
    <button
      onClick={() => {
        if (window.confirm('Deseja remover a logo?')) {
          setMerchant({ ...merchant, logo_url: null });
          setHasChanges(true);
        }
      }}
      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
      title="Remover logo"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
)}


// ========================================
// 📋 INSTRUÇÕES DE SUBSTITUIÇÃO:
// ========================================
//
// 1. Abra: /var/www/cashback/cashback-system/src/pages/WhiteLabelSettings.jsx
//
// 2. Procure a função handleLogoUpload (deve estar por volta da linha 180-250)
//
// 3. SUBSTITUA TODA a função handleLogoUpload pela versão acima
//
// 4. Procure o componente <img> que exibe a logo (por volta da linha 325-350)
//
// 5. SUBSTITUA o bloco inteiro pela versão acima
//
// 6. Salve o arquivo
//
// 7. Rebuilde o projeto:
//    cd /var/www/cashback/cashback-system
//    npm run build
//
// 8. Reinicie o servidor se necessário
//
// ========================================
