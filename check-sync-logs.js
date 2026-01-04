import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkLogs() {
  console.log('🔍 Verificando logs de sincronização Mailchimp...\n');
  
  const { data, error } = await supabase
    .from('integration_sync_logs')
    .select('*')
    .order('synced_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('❌ Erro ao buscar logs:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('⚠️  Nenhum log encontrado');
    return;
  }
  
  console.log(`📊 Últimas ${data.length} sincronizações:\n`);
  data.forEach((log, i) => {
    console.log(`${i + 1}. ${log.synced_at}`);
    console.log(`   Status: ${log.status}`);
    console.log(`   Event: ${log.event_type}`);
    console.log(`   Error: ${log.error_message || 'Nenhum'}`);
    console.log(`   Response: ${log.api_response ? JSON.stringify(log.api_response).substring(0, 100) : 'Nenhum'}`);
    console.log('');
  });
}

checkLogs();
