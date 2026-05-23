const { createClient } = require('@supabase/supabase-js');
// BUG #14 FIX: dotenv.config() is already called in server.js before this module is loaded.
// Calling it again here is redundant and can cause issues if the .env path differs.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Or SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not found in environment variables.');
}

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key');

module.exports = supabase;
