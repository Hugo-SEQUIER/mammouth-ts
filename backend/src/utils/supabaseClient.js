const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' });
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required.');
}

if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY is required.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

module.exports = {
	supabase
}