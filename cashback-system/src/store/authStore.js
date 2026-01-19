import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithPassword, signOut as authSignOut, getSession, fetchMerchantByEmail } from '../services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      merchant: null,
      employee: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setMerchant: (merchant) => set({ merchant }),
      
      setEmployee: (employee) => set({ employee }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // ✅ USAR SUPABASE AUTH - Autenticação real
          const { data: authData, error: authError } = await signInWithPassword(email, password);

          if (authError) {
            throw new Error('Credenciais inválidas');
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

          // Criar objeto employee-like para compatibilidade
          const employeeData = {
            id: authData.user.id,
            email: authData.user.email,
            email_verified: authData.user.email_confirmed_at ? true : false,
            merchant_id: merchant?.id || null,
            is_active: true
          };
          
          set({
            user: { 
              email: authData.user.email, 
              id: authData.user.id 
            },
            employee: employeeData,
            merchant: merchant,
            isAuthenticated: true,
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
          isAuthenticated: false
        });
      },

      checkAuth: async () => {
        // ✅ Verificar sessão do Supabase Auth
        const { data: { session } } = await getSession();
        
        if (session?.user) {
          // Buscar merchant associado
          const { data: merchants } = await fetchMerchantByEmail(session.user.email);

          const merchant = merchants && merchants.length > 0 ? merchants[0] : null;

          const employeeData = {
            id: session.user.id,
            email: session.user.email,
            email_verified: session.user.email_confirmed_at ? true : false,
            merchant_id: merchant?.id || null,
            is_active: true
          };

          set({
            user: { email: session.user.email, id: session.user.id },
            employee: employeeData,
            merchant: merchant,
            isAuthenticated: true
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
