/**
 * 📧 Email Verification Service
 * 
 * Sistema de verificação de email para novos usuários
 */

import { supabase } from './supabase';
import { sendEmailVerification } from './resend';

/**
 * Gerar código de verificação de 6 dígitos
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Enviar código de verificação por email
 */
export async function sendVerificationCode({ email, employeeId, userName }) {
  try {
    console.log('📧 Enviando código de verificação para:', email);
    
    // Gerar código de 6 dígitos
    const verificationCode = generateVerificationCode();
    
    // Expiração: 24 horas
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Salvar no banco de dados
    const { data, error } = await supabase
      .from('email_verifications')
      .insert({
        email: email.toLowerCase().trim(),
        token: verificationCode,
        employee_id: employeeId,
        expires_at: expiresAt.toISOString(),
        verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar código no banco:', error);
      throw error;
    }

    console.log('✅ Código salvo no banco:', data.id);

    // Enviar email
    const emailResult = await sendEmailVerification({
      email,
      verificationCode,
      userName,
    });

    if (!emailResult.success) {
      console.error('❌ Erro ao enviar email:', emailResult.error);
      throw new Error(emailResult.error || 'Erro ao enviar email');
    }

    console.log('✅ Email de verificação enviado:', emailResult.id);

    return {
      success: true,
      message: 'Código de verificação enviado com sucesso!',
    };

  } catch (error) {
    console.error('❌ Erro ao enviar código de verificação:', error);
    return {
      success: false,
      error: error.message || 'Erro ao enviar código de verificação',
    };
  }
}

/**
 * Verificar código de email
 */
export async function verifyEmailCode({ email, code }) {
  try {
    console.log('🔍 Verificando código para:', email);

    // Buscar código no banco
    const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('token', code.trim())
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      console.error('❌ Código inválido ou não encontrado');
      return {
        success: false,
        error: 'Código de verificação inválido',
      };
    }

    // Verificar expiração
    const now = new Date();
    const expiresAt = new Date(verification.expires_at);

    if (now > expiresAt) {
      console.error('❌ Código expirado');
      return {
        success: false,
        error: 'Código de verificação expirado. Solicite um novo código.',
      };
    }

    // Marcar como verificado
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', verification.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar verificação:', updateError);
      throw updateError;
    }

    // Atualizar employee
    if (verification.employee_id) {
      const { error: employeeError } = await supabase
        .from('employees')
        .update({ email_verified: true })
        .eq('id', verification.employee_id);

      if (employeeError) {
        console.error('❌ Erro ao atualizar employee:', employeeError);
        throw employeeError;
      }
    }

    console.log('✅ Email verificado com sucesso!');

    return {
      success: true,
      message: 'Email verificado com sucesso! Você já pode fazer login.',
    };

  } catch (error) {
    console.error('❌ Erro ao verificar código:', error);
    return {
      success: false,
      error: error.message || 'Erro ao verificar código',
    };
  }
}

/**
 * Reenviar código de verificação
 */
export async function resendVerificationCode({ email }) {
  try {
    console.log('🔄 Reenviando código de verificação para:', email);

    // Buscar employee
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (employeeError || !employee) {
      return {
        success: false,
        error: 'Email não encontrado no sistema',
      };
    }

    // Se já verificado
    if (employee.email_verified) {
      return {
        success: false,
        error: 'Este email já foi verificado',
      };
    }

    // Invalidar códigos anteriores
    await supabase
      .from('email_verifications')
      .update({ verified: true })  // Marca como "usado" para invalidar
      .eq('email', email.toLowerCase().trim())
      .eq('verified', false);

    // Enviar novo código
    return await sendVerificationCode({
      email: employee.email,
      employeeId: employee.id,
      userName: employee.name,
    });

  } catch (error) {
    console.error('❌ Erro ao reenviar código:', error);
    return {
      success: false,
      error: error.message || 'Erro ao reenviar código',
    };
  }
}
