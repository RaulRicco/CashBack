-- Atualizar todos os merchants para usar o plano "launch" (R$ 97)
UPDATE merchants 
SET 
  subscription_plan = 'launch',
  customer_limit = 5000,  -- Limite de 5 mil clientes
  employee_limit = 10     -- Limite de 10 funcionários
WHERE subscription_plan IS NULL 
   OR subscription_plan IN ('starter', 'business', 'premium');

-- Verificar resultado
SELECT id, name, subscription_plan, customer_limit, employee_limit 
FROM merchants 
LIMIT 5;
