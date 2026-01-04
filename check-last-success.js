import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkLastSuccess() {
  // Buscar última sincronização BEM-SUCEDIDA do Mailchimp
  const { data, error } = await supabase
    .from('integration_sync_log')
    .select('*')
    .eq('status', 'success')
    .eq('integration_config_id', 'cece01ce-877b-4465-a6b6-ac13515ce040')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  if (data.length === 0) {
    console.log('❌ Nenhuma sincronização bem-sucedida encontrada!');
    return;
  }

  const log = data[0];
  console.log('\n✅ ÚLTIMA SINCRONIZAÇÃO BEM-SUCEDIDA:\n');
  console.log(`Data/Hora: ${log.created_at}`);
  console.log(`Customer ID: ${log.customer_id}`);
  console.log(`Ação: ${log.action}`);
  
  // Calcular há quanto tempo
  const now = new Date();
  const syncDate = new Date(log.created_at);
  const diffMs = now - syncDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  console.log(`\n⏰ Há quanto tempo: ${diffDays} dias e ${diffHours} horas atrás`);
  
  // Buscar cliente
  const { data: customer } = await supabase
    .from('customers')
    .select('name, phone, email')
    .eq('id', log.customer_id)
    .single();
  
  if (customer) {
    console.log(`\n👤 Cliente: ${customer.name} (${customer.phone || customer.email})`);
  }
}

checkLastSuccess();
