import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkCredentials() {
  // Buscar config que está falhando
  const { data: config, error } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('id', 'cece01ce-877b-4465-a6b6-ac13515ce040')
    .single();

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log('\n🔑 CREDENCIAIS MAILCHIMP:\n');
  console.log(`Provider: ${config.provider}`);
  console.log(`Merchant ID: ${config.merchant_id}`);
  console.log(`Is Active: ${config.is_active}`);
  console.log(`\nCREDENCIAIS:`);
  console.log(`API Key: ${config.api_key?.substring(0, 20)}...${config.api_key?.substring(config.api_key.length - 10)} (${config.api_key?.length} chars)`);
  console.log(`Audience ID: ${config.audience_id}`);
  console.log(`Server Prefix (api_token): ${config.api_token}`);
  console.log(`\nOUTROS:`);
  console.log(`Sync on Signup: ${config.sync_on_signup}`);
  console.log(`Sync on Purchase: ${config.sync_on_purchase}`);
  console.log(`Last Sync: ${config.last_sync_at || 'Nunca'}`);
  console.log(`Sync Count: ${config.sync_count}`);
}

checkCredentials();
