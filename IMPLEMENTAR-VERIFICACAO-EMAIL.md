# 📧 IMPLEMENTAÇÃO COMPLETA - VERIFICAÇÃO DE EMAIL

## 🎯 **OBJETIVO**
Adicionar verificação de email obrigatória no sistema de cadastro usando Resend.

---

## 📋 **ETAPAS DE IMPLEMENTAÇÃO**

### **1. EXECUTAR SQL NO SUPABASE** ✅

Arquivo já criado: `SQL-EMAIL-VERIFICATION.sql`

**Acesse:** https://mtylboaluqswdkgljgsd.supabase.co
**SQL Editor** → Cole o conteúdo do arquivo e execute

Isso vai:
- Adicionar campo `email_verified` na tabela `employees`
- Criar tabela `email_verifications` para tokens
- Configurar RLS (Row Level Security)

---

### **2. FUNÇÃO DE ENVIO DE EMAIL** ✅

Já adicionada em `src/lib/resend.js`:
- Função `sendEmailVerification()` 
- Template HTML completo em português
- Código de 6 dígitos + link de verificação

---

### **3. CRIAR BIBLIOTECA DE VERIFICAÇÃO**

Crie o arquivo: `src/lib/emailVerification.js`

```javascript
import { supabase } from './supabase';
import { sendEmailVerification } from './resend';

/**
 * Gerar código de verificação de 6 dígitos
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Criar e enviar código de verificação
 */
export async function sendVerificationCode({ email, employeeId, userName }) {
  try {
    // Gerar código
    const verificationCode = generateVerificationCode();
    
    // Calcular expiração (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Salvar no banco
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

    if (error) throw error;

    // Enviar email
    const emailResult = await sendEmailVerification({
      email,
      verificationCode,
      userName,
    });

    if (!emailResult.success) {
      throw new Error('Erro ao enviar email de verificação');
    }

    return {
      success: true,
      message: 'Email de verificação enviado com sucesso!',
    };

  } catch (error) {
    console.error('Erro ao enviar verificação:', error);
    return {
      success: false,
      error: error.message || 'Erro ao enviar email de verificação',
    };
  }
}

/**
 * Verificar código
 */
export async function verifyEmailCode({ email, code }) {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('token', code)
      .eq('verified', false)
      .single();

    if (tokenError || !tokenData) {
      return {
        success: false,
        error: 'Código inválido ou já utilizado',
      };
    }

    // Verificar expiração
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      return {
        success: false,
        error: 'Código expirado. Solicite um novo código.',
      };
    }

    // Marcar como verificado
    await supabase
      .from('email_verifications')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', tokenData.id);

    // Marcar employee como verificado
    if (tokenData.employee_id) {
      await supabase
        .from('employees')
        .update({ email_verified: true })
        .eq('id', tokenData.employee_id);
    }

    return {
      success: true,
      message: 'Email verificado com sucesso!',
      employeeId: tokenData.employee_id,
    };

  } catch (error) {
    console.error('Erro ao verificar código:', error);
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
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar employee
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, name, email_verified')
      .eq('email', normalizedEmail)
      .single();

    if (employeeError || !employee) {
      return {
        success: false,
        error: 'Email não encontrado',
      };
    }

    if (employee.email_verified) {
      return {
        success: false,
        error: 'Este email já está verificado',
      };
    }

    // Invalidar tokens anteriores
    await supabase
      .from('email_verifications')
      .update({ verified: true }) // Marcar como usado
      .eq('email', normalizedEmail)
      .eq('verified', false);

    // Enviar novo código
    return await sendVerificationCode({
      email: normalizedEmail,
      employeeId: employee.id,
      userName: employee.name,
    });

  } catch (error) {
    console.error('Erro ao reenviar código:', error);
    return {
      success: false,
      error: error.message || 'Erro ao reenviar código',
    };
  }
}
```

---

### **4. MODIFICAR SIGNUP.JSX**

Alterar o arquivo `src/pages/Signup.jsx`:

**TROCAR a seção após criar employee (linha 64-84):**

```javascript
// ANTES:
if (employeeError) throw employeeError;

toast.success('Conta criada com sucesso! Faça login para continuar.');

// Redirecionar para login
setTimeout(() => {
  navigate('/login');
}, 2000);

// DEPOIS:
if (employeeError) throw employeeError;

// 3. Enviar email de verificação
const { sendVerificationCode } = await import('../lib/emailVerification');
const verificationResult = await sendVerificationCode({
  email: formData.ownerEmail,
  employeeId: employeeData.id,
  userName: formData.ownerName,
});

if (verificationResult.success) {
  toast.success('Conta criada! Verifique seu email para ativar.');
  
  // Redirecionar para página de verificação
  setTimeout(() => {
    navigate(`/verify-email?email=${encodeURIComponent(formData.ownerEmail)}`);
  }, 2000);
} else {
  toast.error('Conta criada, mas erro ao enviar email de verificação');
  navigate('/login');
}
```

---

### **5. CRIAR PÁGINA DE VERIFICAÇÃO**

Crie o arquivo: `src/pages/EmailVerification.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Check, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLogo, getBrandName } from '../config/branding';
import { verifyEmailCode, resendVerificationCode } from '../lib/emailVerification';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Auto-verificar se token veio na URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token && email) {
      setCode(token);
      handleVerify(token);
    }
  }, [searchParams]);

  const handleVerify = async (verificationCode = code) => {
    if (!email || !verificationCode) {
      toast.error('Digite o email e o código de verificação');
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error('O código deve ter 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyEmailCode({
        email,
        code: verificationCode,
      });

      if (result.success) {
        toast.success(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Digite seu email');
      return;
    }

    setResending(true);

    try {
      const result = await resendVerificationCode({ email });

      if (result.success) {
        toast.success('Novo código enviado para seu email!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao reenviar código');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src={getLogo('icon')}
              alt={getBrandName()} 
              className="object-contain w-24 h-24"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificar Email
          </h1>
          <p className="text-gray-600">
            Digite o código de 6 dígitos enviado para seu email
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Código */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Verificação
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              maxLength={6}
              required
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
              placeholder="000000"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Digite os 6 dígitos recebidos por email
            </p>
          </div>

          {/* Botão Verificar */}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verificando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Verificar Email
              </>
            )}
          </button>

          {/* Reenviar Código */}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {resending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                Reenviando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Reenviar Código
              </>
            )}
          </button>

          {/* Voltar */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Login
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### **6. MODIFICAR AUTHSTORE**

Alterar `src/store/authStore.js` - função `login`:

**ADICIONAR verificação de email (após linha 32):**

```javascript
// ANTES:
if (employeeError || !employee) {
  throw new Error('Credenciais inválidas');
}

// DEPOIS:
if (employeeError || !employee) {
  throw new Error('Credenciais inválidas');
}

// Verificar se email foi verificado
if (!employee.email_verified) {
  throw new Error('Email não verificado. Verifique seu email antes de fazer login.');
}
```

---

### **7. ADICIONAR ROTA**

Alterar `src/App.jsx` - adicionar rota:

```javascript
import EmailVerification from './pages/EmailVerification';

// Dentro das rotas:
<Route path="/verify-email" element={<EmailVerification />} />
```

---

## 🚀 **ORDEM DE EXECUÇÃO**

1. ✅ Executar `SQL-EMAIL-VERIFICATION.sql` no Supabase
2. ✅ Criar `src/lib/emailVerification.js`
3. ✅ Criar `src/pages/EmailVerification.jsx`
4. ✅ Modificar `src/pages/Signup.jsx`
5. ✅ Modificar `src/store/authStore.js`
6. ✅ Modificar `src/App.jsx` (adicionar rota)
7. ✅ Commit e Deploy

---

## 🧪 **FLUXO DE TESTE**

1. **Criar Conta:**
   - Preencher formulário de cadastro
   - Clicar em "Criar Conta"
   - Sistema cria conta e envia email

2. **Verificar Email:**
   - Abrir email recebido
   - Copiar código de 6 dígitos OU clicar no link
   - Página de verificação valida o código

3. **Fazer Login:**
   - Tentar fazer login antes de verificar → ERRO
   - Verificar email → SUCESSO
   - Fazer login novamente → SUCESSO

---

## 📧 **CONFIGURAÇÕES NECESSÁRIAS**

Já estão configuradas no `.env`:
```
VITE_RESEND_API_KEY=re_gqFK8iHM_CS85k3Gj5Rvkx4VpfEC3b2GF
VITE_RESEND_FROM_EMAIL=onboarding@resend.dev
VITE_RESEND_FROM_NAME=Local CashBack
```

---

## ✅ **CHECKLIST FINAL**

- [ ] SQL executado no Supabase
- [ ] emailVerification.js criado
- [ ] EmailVerification.jsx criado
- [ ] Signup.jsx modificado
- [ ] authStore.js modificado
- [ ] App.jsx com rota adicionada
- [ ] Commit e push
- [ ] Deploy no servidor
- [ ] Teste completo do fluxo

---

**Todos os códigos prontos para copiar e colar!** 🎉
