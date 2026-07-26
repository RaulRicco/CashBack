import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithPassword, signOut as authSignOut, getSession, fetchMerchantByEmail } from '../services/authService';

function hasValidSubscriptionAccess(merchant) {
  const status = String(merchant?.subscription_status || '').toLowerCase();
  const trialEndRaw = merchant?.trial_end_date || merchant?.trial_ends_at;

  if (status === 'active') return true;

  if (status === 'trial') {
    if (!trialEndRaw) return true;
    const trialEnd = new Date(trialEndRaw);
    return !Number.isNaN(trialEnd.getTime()) && trialEnd > new Date();
  }

  return false;
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      merchant: null,
      employee: null,
      isAuthenticated: false,
      isLoading: false,
      // true quando o usuário está autenticado no Supabase mas a assinatura
      // não está em dia (past_due/canceled/expired) — bloqueia acesso ao
      // dashboard sem descartar a sessão, para permitir regularizar o pagamento.
      subscriptionBlocked: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setMerchant: (merchant) => set({ merchant }),

      setEmployee: (employee) => set({ employee }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // ✅ USAR SUPABASE AUTH - Autenticação real
          const { data: authData, error: authError } = await signInWithPassword(email, password);

          if (authError) {
            const authMsg = authError.message || '';
            if (authMsg.toLowerCase().includes('invalid login credentials')) {
              throw new Error('Email ou senha inválidos');
            }
            if (authMsg.toLowerCase().includes('email not confirmed')) {
              throw new Error('Email ainda não confirmado. Verifique sua caixa de entrada.');
            }
            throw new Error(authMsg || 'Erro ao autenticar');
          }

          if (!authData.user) {
            throw new Error('Erro ao fazer login');
          }

          // ✅ Buscar dados do merchant associado ao usuário
          // Assumindo que o email do Auth corresponde ao email do merchant ou há uma relação
          const { data: merchants, error: merchantError } = await fetchMerchantByEmail(email);

          if (merchantError) {
            console.error('Erro ao buscar merchant:', merchantError);
          }

          const merchant = merchants && merchants.length > 0 ? merchants[0] : null;

          if (!merchant) {
            await authSignOut();
            throw new Error('Conta sem estabelecimento vinculado. Fale com o suporte.');
          }

          // Criar objeto employee-like para compatibilidade
          const employeeData = {
            id: authData.user.id,
            email: authData.user.email,
            email_verified: authData.user.email_confirmed_at ? true : false,
            merchant_id: merchant?.id || null,
            is_active: true
          };

          if (!hasValidSubscriptionAccess(merchant)) {
            // Mantém a sessão (não faz signOut) para a tela de regularização
            // poder identificar o merchant e abrir o portal de pagamento Stripe.
            set({
              user: {
                email: authData.user.email,
                id: authData.user.id
              },
              employee: employeeData,
              merchant: merchant,
              isAuthenticated: false,
              subscriptionBlocked: true,
              isLoading: false
            });
            return { success: false, subscriptionBlocked: true };
          }

          set({
            user: {
              email: authData.user.email,
              id: authData.user.id
            },
            employee: employeeData,
            merchant: merchant,
            isAuthenticated: true,
            subscriptionBlocked: false,
            isLoading: false
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        // ✅ Fazer logout no Supabase Auth
        await authSignOut();

        set({
          user: null,
          merchant: null,
          employee: null,
          isAuthenticated: false,
          subscriptionBlocked: false
        });
      },

      checkAuth: async () => {
        // ✅ Verificar sessão do Supabase Auth
        const { data: { session } } = await getSession();

        if (session?.user) {
          // Buscar merchant associado
          const { data: merchants } = await fetchMerchantByEmail(session.user.email);

          const merchant = merchants && merchants.length > 0 ? merchants[0] : null;

          if (!merchant) {
            await get().logout();
            return;
          }

          const employeeData = {
            id: session.user.id,
            email: session.user.email,
            email_verified: session.user.email_confirmed_at ? true : false,
            merchant_id: merchant?.id || null,
            is_active: true
          };

          if (!hasValidSubscriptionAccess(merchant)) {
            // Mantém a sessão Supabase válida, apenas bloqueia o acesso ao
            // dashboard até a assinatura ser regularizada.
            set({
              user: { email: session.user.email, id: session.user.id },
              employee: employeeData,
              merchant: merchant,
              isAuthenticated: false,
              subscriptionBlocked: true
            });
            return;
          }

          set({
            user: { email: session.user.email, id: session.user.id },
            employee: employeeData,
            merchant: merchant,
            isAuthenticated: true,
            subscriptionBlocked: false
          });
        } else {
          get().logout();
        }
      }
    }),
    {
      name: 'auth-storage',
      version: 2,
      // Migrar storage antigo para formato mínimo e remover PII
      migrate: (persistedState, version) => {
        try {
          const safeUser = persistedState?.user
            ? { email: persistedState.user.email, id: persistedState.user.id }
            : null;
          return {
            user: safeUser,
            isAuthenticated: !!safeUser
          };
        } catch (e) {
          return { user: null, isAuthenticated: false };
        }
      },
      // Persistir apenas o mínimo necessário
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
