import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkError() {
  const { data, error } = await supabase
    .from('integration_sync_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log('\n📊 Últimas 5 Sincronizações:\n');
  
  data.forEach((log, i) => {
    console.log(`${i + 1}) ${log.created_at}`);
    console.log(`   Ação: ${log.action}`);
    console.log(`   Status: ${log.status}`);
    console.log(`   Customer ID: ${log.customer_id || 'N/A'}`);
    console.log(`   Integration Config ID: ${log.integration_config_id || 'N/A'}`);
    
    if (log.error_message) {
      console.log(`   ❌ Erro: ${log.error_message}`);
    }
    
    if (log.request_data) {
      console.log(`   📤 Request Data: ${JSON.stringify(log.request_data).substring(0, 100)}...`);
    }
    
    if (log.response_data) {
      console.log(`   📥 Response Data: ${JSON.stringify(log.response_data).substring(0, 100)}...`);
    }
    
    console.log('');
  });
}

checkError();
