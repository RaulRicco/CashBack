import { createClient } from '@supabase/supabase-js';

// INJEÇÃO DIRETA - SEM DEPENDÊNCIA DE .ENV
const supabaseUrl = "https://zxiehkdtsoeauquowxvi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4aWVoa2R0c29lYXVxb3V3eHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTkyMTMsImV4cCI6MjA3ODQ5NTIxM30.6t5Aw0dUjNZrmuy_g_XUEW0acZoY5TCQs5ru_Jksms4";

console.log("🚀 [SISTEMA] Conectando ao Supabase via Hardcode...");

export const supabase = createClient(supabaseUrl, supabaseKey);
