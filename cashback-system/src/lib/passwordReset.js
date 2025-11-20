/**
 * 🔒 Password Reset Logic - Supabase Auth Native
 * 
 * Funções para recuperação de senha usando Supabase Auth nativo
 * Não usa mais tabela customizada de tokens
 */

import { supabase } from './supabase';

/**
 * Solicitar recuperação de senha
 * 
 * @param {string} email - Email do usuário
 * @param {string} userType - 'merchant' ou 'customer'
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function requestPasswordReset(email, userType = 'merchant') {
  try {
    console.log(`🔒 Solicitando reset de senha para ${userType}:`, email);

    // Validar tipo de usuário
    if (!['merchant', 'customer'].includes(userType)) {
      throw new Error('Tipo de usuário inválido');
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar se usuário existe no Supabase Auth
    // Nota: Para estabelecimentos (merchants), verificar se o email existe na tabela merchants
    if (userType === 'merchant') {
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id, email, business_name')
        .eq('email', normalizedEmail)
        .single();

      if (merchantError || !merchant) {
        // Por segurança, não revelar se email existe ou não
        console.log('❌ Merchant não encontrado, mas retornando sucesso para não expor');
        return {
          success: true,
          message: 'Se o email existir no sistema, você receberá um email de recuperação.',
        };
      }

      console.log('✅ Merchant encontrado:', merchant.id);
    }

    // Usar o método nativo do Supabase Auth para reset de senha
    // Isso envia um email com link mágico para resetar a senha
    const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('❌ Erro ao enviar email de reset:', error);
      // Mesmo com erro, retornar sucesso para não expor se email existe
      return {
        success: true,
        message: 'Se o email existir no sistema, você receberá um email de recuperação.',
      };
    }

    console.log('✅ Email de recuperação enviado via Supabase Auth!');

    return {
      success: true,
      message: 'Email de recuperação enviado! Verifique sua caixa de entrada.',
    };

  } catch (error) {
    console.error('❌ Erro ao solicitar reset:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar solicitação',
    };
  }
}

/**
 * Atualizar senha do usuário autenticado
 * Usado após o usuário clicar no link mágico do email
 * 
 * @param {string} newPassword - Nova senha
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function updateUserPassword(newPassword) {
  try {
    console.log('🔒 Atualizando senha...');

    // Validar senha
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'A senha deve ter pelo menos 6 caracteres',
      };
    }

    // Usar método nativo do Supabase Auth para atualizar senha
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      return {
        success: false,
        error: error.message || 'Erro ao atualizar senha',
      };
    }

    console.log('✅ Senha atualizada com sucesso!');

    return {
      success: true,
      message: 'Senha alterada com sucesso!',
    };

  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar solicitação',
    };
  }
}

/**
 * Verificar se usuário está em sessão de recuperação de senha
 * (após clicar no link do email)
 * 
 * @returns {Promise<{isRecovery: boolean, user?: object}>}
 */
export async function checkPasswordRecoverySession() {
  try {
    // Verificar se há hash de recovery na URL (tipo=recovery)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    console.log('🔍 Verificando URL hash:', {
      hash: window.location.hash,
      type: type
    });

    // Se não é do tipo recovery, verificar se há sessão ativa
    if (type !== 'recovery') {
      // Tentar obter sessão existente
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Sessão ativa encontrada para:', session.user.email);
        return {
          isRecovery: true,
          user: session.user
        };
      }
      
      console.log('❌ Não é link de recovery e não há sessão ativa');
      return { isRecovery: false };
    }

    // É um link de recovery, processar os tokens da URL
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');

    if (!access_token) {
      console.error('❌ Token não encontrado na URL');
      return { isRecovery: false };
    }

    // Estabelecer sessão com os tokens da URL
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (error) {
      console.error('❌ Erro ao estabelecer sessão:', error);
      return { isRecovery: false };
    }

    if (data.session?.user) {
      console.log('✅ Sessão de recuperação estabelecida para:', data.session.user.email);
      
      // Limpar os tokens da URL para melhor UX
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return {
        isRecovery: true,
        user: data.session.user
      };
    }

    return { isRecovery: false };

  } catch (error) {
    console.error('❌ Erro ao verificar sessão:', error);
    return { isRecovery: false };
  }
}
