-- 1. Check the trigger function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'update_customer_balance';

-- 2. Check customer's actual data
SELECT id, phone, name, available_cashback, total_cashback, total_spent, created_at
FROM customers 
WHERE phone = '6111111111'
ORDER BY created_at DESC;

-- 3. Check customer's transactions (both cashback and redemption)
SELECT 
  id, 
  transaction_type, 
  amount, 
  cashback_amount, 
  status, 
  created_at,
  customer_id
FROM transactions 
WHERE customer_id IN (SELECT id FROM customers WHERE phone = '6111111111')
ORDER BY created_at DESC;

-- 4. Check redemptions
SELECT 
  id,
  amount,
  status,
  created_at,
  customer_id
FROM redemptions
WHERE customer_id IN (SELECT id FROM customers WHERE phone = '6111111111')
ORDER BY created_at DESC;
