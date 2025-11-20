-- Verificar clientes com email cadastrado
SELECT 
  c.id,
  c.name,
  c.phone,
  c.email,
  m.business_name as merchant_name,
  m.signup_link_slug as merchant_slug
FROM customers c
LEFT JOIN merchants m ON c.referred_by_merchant_id = m.id
WHERE c.email IS NOT NULL 
  AND c.email != ''
  AND m.is_active = true
ORDER BY c.created_at DESC
LIMIT 5;
