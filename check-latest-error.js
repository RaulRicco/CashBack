import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkLatestError() {
  const { data, error } = await supabase
    .from('integration_sync_log')
    .select('*')
    .eq('status', 'error')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  if (data.length === 0) {
    console.log('✅ Nenhum erro encontrado!');
    return;
  }

  const log = data[0];
  console.log('\n📊 ÚLTIMO ERRO DE INTEGRAÇÃO:\n');
  console.log(`Data/Hora: ${log.created_at}`);
  console.log(`Customer ID: ${log.customer_id}`);
  console.log(`Integration Config ID: ${log.integration_config_id}`);
  console.log(`Ação: ${log.action}`);
  console.log(`❌ Erro: ${log.error_message}`);
  
  if (log.request_data) {
    console.log(`\n📤 REQUEST DATA:`);
    console.log(JSON.stringify(log.request_data, null, 2));
  }
  
  if (log.response_data) {
    console.log(`\n📥 RESPONSE DATA:`);
    console.log(JSON.stringify(log.response_data, null, 2));
  }
  
  // Buscar nome do cliente
  const { data: customer } = await supabase
    .from('customers')
    .select('name, phone, email')
    .eq('id', log.customer_id)
    .single();
  
  if (customer) {
    console.log(`\n👤 CLIENTE:`);
    console.log(`Nome: ${customer.name}`);
    console.log(`Telefone: ${customer.phone}`);
    console.log(`Email: ${customer.email}`);
  }
}

checkLatestError();
