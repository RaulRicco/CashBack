import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { SUBSCRIPTION_PLANS } from '../lib/stripe';

/**
 * Hook personalizado para gerenciar assinatura e limites
 * Fornece informações sobre o plano atual e verificações de limites
 */
export function useSubscription() {
  const { merchant } = useAuthStore();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (merchant?.id) {
      loadSubscriptionData();
    }
  }, [merchant?.id]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);

      // Buscar dados de assinatura do merchant
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select(`
          subscription_status,
          subscription_plan,
          customer_limit,
          employee_limit,
          features_enabled,
          trial_ends_at,
          subscription_ends_at
        `)
        .eq('id', merchant.id)
        .single();

      if (merchantError) throw merchantError;

      // Contar clientes únicos (baseado em transações)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('customer_id')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed');

      const uniqueCustomers = [...new Set(transactions?.map(t => t.customer_id) || [])];
      const totalCustomers = uniqueCustomers.length;

      // Contar funcionários
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id);

      setSubscriptionData(merchantData);
      setCustomerCount(totalCustomers);
      setEmployeeCount(totalEmployees || 0);
    } catch (error) {
      console.error('Erro ao carregar dados de assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data (útil após adicionar cliente/funcionário)
  const refresh = () => {
    loadSubscriptionData();
  };

  // Plano único "lançamento" — sem limites e com todas as features liberadas
  const checks = {
    canAddCustomer: true,
    canAddEmployee: true,
    isNearCustomerLimit: false,
    isNearEmployeeLimit: false,
  };

  // Verificar se tem uma feature específica — sempre liberado
  const checkFeature = () => true;

  // Plano único "lançamento"
  const currentPlan = SUBSCRIPTION_PLANS.launch;

  return {
    // Estado
    loading,
    subscriptionData,
    currentPlan,
    customerCount,
    employeeCount,
    
    // Verificações
    checks,
    checkFeature,
    
    // Funções
    refresh,
  };
}
