import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkRecentErrors() {
  // Buscar TODOS os erros recentes
  const { data, error } = await supabase
    .from('integration_sync_log')
    .select('*')
    .eq('status', 'error')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log('\n📊 ÚLTIMOS 5 ERROS DE INTEGRAÇÃO:\n');
  
  if (data.length === 0) {
    console.log('✅ Nenhum erro encontrado!');
    return;
  }
  
  data.forEach((log, i) => {
    console.log(`${i + 1}) ${log.created_at}`);
    console.log(`   Customer ID: ${log.customer_id}`);
    console.log(`   Ação: ${log.action}`);
    console.log(`   ❌ Erro: ${log.error_message}`);
    
    // Buscar nome do cliente
    supabase
      .from('customers')
      .select('name, phone, email')
      .eq('id', log.customer_id)
      .single()
      .then(({ data: customer }) => {
        if (customer) {
          console.log(`   👤 Cliente: ${customer.name} (${customer.phone || customer.email})`);
        }
      });
    
    console.log('');
  });
}

checkRecentErrors();

// Aguardar 2 segundos para que as queries dos clientes completem
setTimeout(() => process.exit(0), 2000);
