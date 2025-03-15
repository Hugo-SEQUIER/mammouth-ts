/**
 * Script to run the database cleaning utility
 * 
 * Usage: 
 * 1. Make sure environment variables are set (SUPABASE_URL, SUPABASE_ANON_KEY)
 * 2. Run with: node cleanDatabase.js
 */

require('dotenv').config(); // Load environment variables
const { cleanDatabase } = require('./src/utils/scriptClean');

console.log('Starting database cleaning script...');

cleanDatabase()
  .then(() => {
    console.log('Database cleaning completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database cleaning failed:', err);
    process.exit(1);
  }); 