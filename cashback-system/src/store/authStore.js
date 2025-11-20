import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

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
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (authError) {
            throw new Error('Credenciais inválidas');
          }

          if (!authData.user) {
            throw new Error('Erro ao fazer login');
          }

          // ✅ Buscar dados do merchant associado ao usuário
          // Assumindo que o email do Auth corresponde ao email do merchant ou há uma relação
          const { data: merchants, error: merchantError } = await supabase
            .from('merchants')
            .select('*')
            .eq('email', email)
            .limit(1);

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
        await supabase.auth.signOut();
        
        set({
          user: null,
          merchant: null,
          employee: null,
          isAuthenticated: false
        });
      },

      checkAuth: async () => {
        // ✅ Verificar sessão do Supabase Auth
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Buscar merchant associado
          const { data: merchants } = await supabase
            .from('merchants')
            .select('*')
            .eq('email', session.user.email)
            .limit(1);

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
      partialize: (state) => ({
        user: state.user,
        merchant: state.merchant,
        employee: state.employee,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
