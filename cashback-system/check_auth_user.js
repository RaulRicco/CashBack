import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Definido' : 'Não definido');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  const email = 'raul.vendasbsb@gmail.com';
  
  console.log('\n🔍 Verificando usuário:', email);
  console.log('━'.repeat(50));
  
  // 1. Verificar se existe na tabela merchants
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, email, business_name')
    .eq('email', email)
    .single();
  
  console.log('\n📊 Merchant na tabela merchants:');
  if (merchantError) {
    console.log('❌ Erro:', merchantError.message);
  } else if (merchant) {
    console.log('✅ Encontrado:', merchant);
  } else {
    console.log('❌ Não encontrado');
  }
  
  // 2. Verificar se existe no Supabase Auth (usando service role)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  console.log('\n🔐 Usuário no Supabase Auth:');
  if (authError) {
    console.log('❌ Erro ao listar usuários:', authError.message);
  } else {
    const authUser = authUsers.users.find(u => u.email === email);
    if (authUser) {
      console.log('✅ Encontrado:', {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        email_confirmed_at: authUser.email_confirmed_at
      });
    } else {
      console.log('❌ Não encontrado no Supabase Auth');
      console.log('📝 Total de usuários no Auth:', authUsers.users.length);
    }
  }
  
  // 3. Se o usuário não existe no Auth, vamos criar
  if (merchant && (!authUsers.users.find(u => u.email === email))) {
    console.log('\n🔧 Criando usuário no Supabase Auth...');
    
    // Criar senha temporária
    const tempPassword = 'Temp123456!';
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        merchant_id: merchant.id,
        business_name: merchant.business_name
      }
    });
    
    if (createError) {
      console.log('❌ Erro ao criar usuário:', createError.message);
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log('📧 Email:', email);
      console.log('🔑 Senha temporária:', tempPassword);
      console.log('⚠️  O usuário pode agora usar "Esqueceu a senha" para criar uma nova senha');
    }
  }
}

checkUser().catch(console.error);
