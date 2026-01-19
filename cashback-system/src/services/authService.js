import { supabase } from '../lib/supabase';

export async function signInWithPassword(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getSession() {
  return await supabase.auth.getSession();
}

export async function fetchMerchantByEmail(email) {
  return await supabase
    .from('merchants')
    .select('*')
    .eq('email', email)
    .limit(1);
}