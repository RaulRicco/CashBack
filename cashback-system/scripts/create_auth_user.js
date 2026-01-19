import { createClient } from '@supabase/supabase-js';
// Espera variáveis de ambiente já exportadas pelo shell (source ../.env)

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser() {
  const email = 'raul.vendasbsb@gmail.com';
  const password = 'Cashback2025!'; // Senha temporária forte
  
  console.log('\n🔧 Criando usuário no Supabase Auth...');
  console.log('📧 Email:', email);
  console.log('🔑 Senha:', password);
  console.log('━'.repeat(50));
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        merchant_id: 'd1de704a-2b5b-4b5d-a675-a413c965f16c',
      }
    }
  });
  
  if (error) {
    if (error.message.includes('already registered')) {
      console.log('✅ Usuário já existe no Supabase Auth!');
      console.log('📝 Você pode usar "Esqueceu a senha" para resetar');
      
      console.log('\n🔄 Tentando enviar email de recuperação...');
      const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: 'http://31.97.167.88:8080/reset-password'
        }
      );
      
      if (resetError) {
        console.log('❌ Erro ao enviar email:', resetError.message);
        console.log('\n⚠️  PROBLEMA: O Supabase não está configurado para enviar emails!');
        console.log('📋 Soluções:');
        console.log('   1. Configure SMTP no Supabase Dashboard');
        console.log('   2. Ou use a senha temporária para login: ' + password);
      } else {
        console.log('✅ Email de recuperação enviado!');
      }
    } else {
      console.log('❌ Erro ao criar usuário:', error.message);
    }
    return;
  }
  
  if (data.user) {
    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', data.user.email);
    console.log('🆔 ID:', data.user.id);
    console.log('🔑 Senha temporária:', password);
    console.log('\n⚠️  IMPORTANTE: Use essa senha para fazer login!');
    console.log('   Depois você pode trocar a senha no sistema');
  }
}

createUser().catch(console.error);
