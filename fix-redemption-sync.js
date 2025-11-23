#!/usr/bin/env node

// Script para habilitar sync_on_redemption para todas as integrações ativas

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gujqbngffglkbgrcmzge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anFibmdmZmdsa2JncmNtemdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMDI1MzksImV4cCI6MjA0NTg3ODUzOX0.tJFphSn-aQ0kKsm-OzvSBIGGlsrzrZlJXEKa2iSVqrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRedemptionSync() {
  console.log('🔍 Verificando configurações de integração...\n');

  // Buscar todas as integrações
  const { data: configs, error } = await supabase
    .from('integration_configs')
    .select('*');

  if (error) {
    console.error('❌ Erro ao buscar configurações:', error);
    return;
  }

  console.log(`📊 Encontradas ${configs.length} configuração(ões)\n`);

  for (const config of configs) {
    console.log(`\n🔧 Configuração ID ${config.id}:`);
    console.log(`   Provider: ${config.provider}`);
    console.log(`   Ativa: ${config.is_active}`);
    console.log(`   sync_on_signup: ${config.sync_on_signup}`);
    console.log(`   sync_on_purchase: ${config.sync_on_purchase}`);
    console.log(`   sync_on_redemption: ${config.sync_on_redemption}`);

    // Se sync_on_redemption estiver false, habilitar
    if (config.sync_on_redemption === false) {
      console.log(`   ⚠️  sync_on_redemption está DESABILITADO!`);
      console.log(`   ✅ Habilitando sync_on_redemption...`);

      const { error: updateError } = await supabase
        .from('integration_configs')
        .update({ sync_on_redemption: true })
        .eq('id', config.id);

      if (updateError) {
        console.error(`   ❌ Erro ao atualizar:`, updateError);
      } else {
        console.log(`   ✅ sync_on_redemption HABILITADO com sucesso!`);
      }
    } else {
      console.log(`   ✅ sync_on_redemption já está HABILITADO`);
    }
  }

  console.log('\n\n🎉 Processo concluído!');
  console.log('\n📝 Resumo:');
  console.log(`   - Total de configurações: ${configs.length}`);
  console.log(`   - Todas as integrações agora sincronizam no evento "redemption"`);
}

fixRedemptionSync().catch(console.error);
