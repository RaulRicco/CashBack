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
          // Buscar funcionário
          const { data: employee, error: employeeError } = await supabase
            .from('employees')
            .select('*, merchant:merchants(*)')
            .eq('email', email)
            .eq('is_active', true)
            .single();

          if (employeeError || !employee) {
            throw new Error('Credenciais inválidas');
          }

          // TODO: Implementar verificação real de senha com bcrypt
          // Por enquanto, aceitar qualquer senha para desenvolvimento
          
          set({
            user: { email: employee.email, id: employee.id },
            employee: employee,
            merchant: employee.merchant,
            isAuthenticated: true,
            isLoading: false
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          user: null,
          merchant: null,
          employee: null,
          isAuthenticated: false
        });
      },

      checkAuth: async () => {
        const state = get();
        if (state.isAuthenticated && state.employee) {
          // Revalidar sessão
          const { data: employee } = await supabase
            .from('employees')
            .select('*, merchant:merchants(*)')
            .eq('id', state.employee.id)
            .eq('is_active', true)
            .single();

          if (employee) {
            set({
              employee: employee,
              merchant: employee.merchant
            });
          } else {
            get().logout();
          }
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
