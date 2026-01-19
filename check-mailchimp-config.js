import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkConfig() {
  console.log('🔍 Verificando configurações de integração Mailchimp...\n');
  
  const { data, error } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('provider', 'mailchimp')
    .eq('is_active', true);
  
  if (error) {
    console.error('❌ Erro ao buscar configurações:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('⚠️  Nenhuma integração Mailchimp ativa encontrada!');
    console.log('\n📝 SOLUÇÃO: Configure a integração Mailchimp no dashboard do merchant');
    return;
  }
  
  console.log(`✅ ${data.length} integração(ões) Mailchimp ativa(s):\n`);
  data.forEach((config, i) => {
    console.log(`Integração ${i + 1}:`);
    console.log(`  Merchant ID: ${config.merchant_id}`);
    console.log(`  Sync on Signup: ${config.sync_on_signup ? '✅' : '❌'}`);
    console.log(`  Sync on Purchase: ${config.sync_on_purchase ? '✅' : '❌'}`);
    console.log(`  Last Sync: ${config.last_sync_at || 'Nunca'}`);
    console.log(`  Sync Count: ${config.sync_count || 0}`);
    console.log('');
  });
}

checkConfig();
