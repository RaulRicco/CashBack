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
          // Autenticar com Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (authError) {
            throw new Error(authError.message);
          }

          if (!authData.user) {
            throw new Error('Credenciais inválidas');
          }

          // Buscar dados do merchant associado ao user_id
          const { data: merchants, error: merchantError } = await supabase
            .from('merchants')
            .select('*')
            .eq('id', authData.user.id);

          if (merchantError) {
            console.error('Erro ao buscar merchant:', merchantError);
          }

          const merchant = merchants && merchants.length > 0 ? merchants[0] : null;
          
          set({
            user: authData.user,
            employee: null, // Não usamos mais employees
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
        await supabase.auth.signOut();
        set({
          user: null,
          merchant: null,
          employee: null,
          isAuthenticated: false
        });
      },

      checkAuth: async () => {
        // Verificar sessão do Supabase Auth
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Buscar merchant associado
          const { data: merchants } = await supabase
            .from('merchants')
            .select('*')
            .eq('id', session.user.id);

          const merchant = merchants && merchants.length > 0 ? merchants[0] : null;

          set({
            user: session.user,
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
