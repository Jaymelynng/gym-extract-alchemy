// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fqtphuqixvndqurapzdq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdHBodXFpeHZuZHF1cmFwemRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NDU0MDAsImV4cCI6MjA2NzUyMTQwMH0.EXNSANGQ6MdlDnW_gpwolwSdMl3O6zN8gcSI14zaliA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});