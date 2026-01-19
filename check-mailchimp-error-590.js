import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkError590() {
  // Buscar erros recentes com código 590
  const { data, error } = await supabase
    .from('integration_sync_log')
    .select('*')
    .eq('status', 'error')
    .ilike('error_message', '%590%')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log('\n📊 ERROS COM CÓDIGO 590:\n');
  
  data.forEach((log, i) => {
    console.log(`${i + 1}) ${log.created_at}`);
    console.log(`   Customer ID: ${log.customer_id}`);
    console.log(`   Integration Config ID: ${log.integration_config_id}`);
    console.log(`   ❌ Erro: ${log.error_message}`);
    
    if (log.request_data) {
      const req = JSON.parse(JSON.stringify(log.request_data));
      console.log(`   📤 Request Email: ${req.email || 'N/A'}`);
      console.log(`   📤 Request Name: ${req.name || 'N/A'}`);
    }
    
    if (log.response_data) {
      console.log(`   📥 Response: ${JSON.stringify(log.response_data).substring(0, 200)}`);
    }
    
    console.log('');
  });
  
  // Buscar configuração da integração que está falhando
  if (data.length > 0) {
    const configId = data[0].integration_config_id;
    
    const { data: config, error: configError } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('id', configId)
      .single();
    
    if (!configError && config) {
      console.log('⚙️ CONFIGURAÇÃO DA INTEGRAÇÃO:\n');
      console.log(`Provider: ${config.provider}`);
      console.log(`Merchant ID: ${config.merchant_id}`);
      console.log(`Is Active: ${config.is_active}`);
      console.log(`API Key Length: ${config.api_key?.length || 0}`);
      console.log(`Audience ID: ${config.audience_id || 'N/A'}`);
      console.log(`Server Prefix: ${config.api_token || 'N/A'}`);
      console.log(`Last Sync: ${config.last_sync_at || 'Nunca'}`);
    }
  }
}

checkError590();
