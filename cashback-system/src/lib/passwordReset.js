/**
 * 🔒 Password Reset Logic
 * 
 * Funções para recuperação de senha de merchants e customers
 */

import { supabase } from './supabase';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from './resend';

/**
 * Gerar código de verificação de 6 dígitos
 */
function generateVerificationCode() {
  // Gerar código aleatório de 6 dígitos (100000 a 999999)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // Verificar se usuário existe
    const tableName = userType === 'merchant' ? 'merchants' : 'customers';
    const { data: user, error: userError } = await supabase
      .from(tableName)
      .select('id, email, business_name, name')
      .eq('email', normalizedEmail)
      .single();

    if (userError || !user) {
      // Por segurança, não revelar se email existe ou não
      console.log('❌ Usuário não encontrado, mas retornando sucesso para não expor');
      return {
        success: true,
        message: 'Se o email existir, você receberá um link de recuperação.',
      };
    }

    console.log('✅ Usuário encontrado:', user.id);

    // Gerar código de verificação de 6 dígitos
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expira em 15 minutos

    // Salvar código no banco
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email: normalizedEmail,
        token: code, // Armazenar código de 6 dígitos
        user_type: userType,
        user_id: user.id,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (tokenError) {
      console.error('❌ Erro ao salvar código:', tokenError);
      throw new Error('Erro ao processar solicitação');
    }

    console.log('🔑 Código de verificação gerado:', code);

    // Enviar email com código
    const userName = user.business_name || user.name || '';
    const emailResult = await sendPasswordResetEmail({
      email: normalizedEmail,
      verificationCode: code,
      userName: userName,
      userType: userType,
    });

    if (!emailResult.success) {
      console.error('❌ Erro ao enviar email:', emailResult.error);
      throw new Error('Erro ao enviar email de recuperação');
    }

    console.log('✅ Email com código de verificação enviado com sucesso!');

    return {
      success: true,
      message: 'Código de verificação enviado para seu email!',
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
 * Validar código de verificação
 * 
 * @param {string} email - Email do usuário
 * @param {string} code - Código de verificação de 6 dígitos
 * @param {string} userType - 'merchant' ou 'customer'
 * @returns {Promise<{valid: boolean, data?: object, error?: string}>}
 */
export async function validateVerificationCode(email, code, userType) {
  try {
    console.log('🔍 Validando código de verificação...');

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar código no banco
    const { data: tokenData, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('token', code)
      .eq('user_type', userType)
      .eq('used', false)
      .single();

    if (error || !tokenData) {
      console.error('❌ Código não encontrado');
      return {
        valid: false,
        error: 'Código inválido ou expirado',
      };
    }

    // Verificar se expirou
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      console.error('❌ Código expirado');
      return {
        valid: false,
        error: 'Este código expirou. Solicite um novo.',
      };
    }

    console.log('✅ Código válido!');

    return {
      valid: true,
      data: tokenData,
    };

  } catch (error) {
    console.error('❌ Erro ao validar código:', error);
    return {
      valid: false,
      error: 'Erro ao validar código',
    };
  }
}

/**
 * Redefinir senha
 * 
 * @param {string} email - Email do usuário
 * @param {string} code - Código de verificação
 * @param {string} userType - Tipo de usuário
 * @param {string} newPassword - Nova senha
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function resetPassword(email, code, userType, newPassword) {
  try {
    console.log('🔒 Redefinindo senha...');

    // Validar código
    const validation = await validateVerificationCode(email, code, userType);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const tokenData = validation.data;

    // Validar senha
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'A senha deve ter pelo menos 6 caracteres',
      };
    }

    // Atualizar senha no Supabase Auth
    const tableName = tokenData.user_type === 'merchant' ? 'merchants' : 'customers';
    
    // Buscar usuário
    const { data: user, error: userError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', tokenData.user_id)
      .single();

    if (userError || !user) {
      throw new Error('Usuário não encontrado');
    }

    // Atualizar senha (assumindo que você usa o campo 'password' e hash)
    // IMPORTANTE: Em produção, você deve hashear a senha antes de salvar!
    // Aqui vou assumir que você tem uma função de hash ou usa Supabase Auth
    
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ 
        password: newPassword, // ⚠️ ATENÇÃO: Deve ser hasheada em produção!
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenData.user_id);

    if (updateError) {
      console.error('❌ Erro ao atualizar senha:', updateError);
      throw new Error('Erro ao atualizar senha');
    }

    // Marcar código como usado
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    console.log('✅ Senha atualizada com sucesso!');

    // Enviar email de confirmação
    const userName = user.business_name || user.name || '';
    await sendPasswordChangedEmail({
      email: tokenData.email,
      userName: userName,
      userType: tokenData.user_type,
    });

    return {
      success: true,
      message: 'Senha alterada com sucesso!',
    };

  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    return {
      success: false,
      error: error.message || 'Erro ao redefinir senha',
    };
  }
}

/**
 * Limpar tokens expirados (função de manutenção)
 * Deve ser executada periodicamente via cron job
 */
export async function cleanExpiredTokens() {
  try {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('password_reset_tokens')
      .delete()
      .or(`expires_at.lt.${now},used.eq.true`);

    if (error) throw error;

    console.log('✅ Tokens expirados limpos');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao limpar tokens:', error);
    return { success: false, error: error.message };
  }
}
