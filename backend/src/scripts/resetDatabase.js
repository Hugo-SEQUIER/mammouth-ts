const { supabase } = require('../utils/supabaseClient');

const resetUserData = async () => {
  console.log('Starting database reset...');
  
  // Retrieve all users
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('user_public_key')
    .eq('user_public_key', 'BzMq8yKSfW796fSk1oLuA7fVGtntxNSbnEXEQer3jdtk');
  
  if (fetchError) {
    console.error('Error retrieving users:', fetchError);
    return;
  }
  console.log("users", users);
  console.log(`Resetting data for ${users.length} users...`);
  
  // Process each user
  for (const user of users) {
    const userPublicKey = user.user_public_key;
    
    try {
      console.log(`Processing user: ${userPublicKey}`);
      
      // Get current nb_click and nb_click_allowed values before reset
      const { data: basicInfo, error: basicInfoError } = await supabase
        .from('basic_info')
        .select('nb_click, nb_click_allowed')
        .eq('user_public_key', userPublicKey)
        .single();
      
      if (basicInfoError) {
        console.error(`Error retrieving basic info for user ${userPublicKey}:`, basicInfoError);
        continue;
      }
      
      // Preserve these values
      const nbClick = basicInfo?.nb_click || 0;
      const nbClickAllowed = basicInfo?.nb_click_allowed || 0;
      
      // Reset basic_info while preserving nb_click and nb_click_allowed
      await supabase.from('basic_info').upsert({
        user_public_key: userPublicKey,
        ice: 0,
        ice_per_click: 1,
        ice_per_second: 0,
        money: 0,
        nb_click: nbClick,          // Preserve nb_click
        nb_click_allowed: nbClickAllowed  // Preserve nb_click_allowed
      });
      
      // Reset items
      await supabase.from('items').upsert({
        user_public_key: userPublicKey,
        pickaxe_level: 1,
        pickaxe_upgrade_cost: 10,
        gloves_level: 1,
        gloves_upgrade_cost: 100,
        user_level: 1,
        cost_upgrade: 100
      });
      
      // Reset company
      await supabase.from('company').upsert({
        user_public_key: userPublicKey,
        level: 0,
        upgrade_cost: 100,
        reputation: 0,
        cash_flow: 0
      });
      
      // Reset market
      await supabase.from('market').upsert({
        user_public_key: userPublicKey,
        market_price: 1,
        user_price: 1,
        public_demand: 0,
        ice_sell: 0
      });
      
      // Reset laboratory
      await supabase.from('laboratory').upsert({
        user_public_key: userPublicKey,
        level: 0,
        upgrade_cost: 1000,
        search_cost: 10,
        research_speed: 1
      });
      
      // Reset shop
      await supabase.from('shop').upsert({
        user_public_key: userPublicKey,
        energy_bar_price: 50,
        energy_bar_is_active: false,
        energy_bar_boost: 1.15
      });
      
      // Delete all research entries and re-create them as empty
      await supabase.from('research')
        .delete()
        .eq('user_public_key', userPublicKey);
      
      // Delete all investment entries and re-create them as empty
      await supabase.from('investments')
        .delete()
        .eq('user_public_key', userPublicKey);
      
      // Delete all achievements
      await supabase.from('achievements')
        .delete()
        .eq('user_public_key', userPublicKey);
      
      // Handle employees - reset all to 0 except set the 4th employee to 0 specifically
      // First delete all employees
      await supabase.from('employees')
        .delete()
        .eq('user_public_key', userPublicKey);
      
      // Re-create employee records
      const employeeTypes = [
        { job: "Junior Miner", amount: 0, salary: 100, happiness: 0, production: 1 },
        { job: "Senior Miner", amount: 0, salary: 600, happiness: 0, production: 2 },
        { job: "Frost Mage", amount: 0, salary: 1500, happiness: 0, production: 3.2 },
        { job: "Yeti", amount: 0, salary: 3000, happiness: 0, production: 4.5 },
      ];
      
      for (const employee of employeeTypes) {
        await supabase.from('employees').insert({
          user_public_key: userPublicKey,
          job: employee.job,
          amount: employee.amount,
          salary: employee.salary,
          happiness: employee.happiness,
          production: employee.production
        });
      }
      
      console.log(`Reset completed successfully for user: ${userPublicKey}`);
    } catch (error) {
      console.error(`Error resetting data for user ${userPublicKey}:`, error);
    }
  }
  
  console.log('Database reset completed!');
};

// Execute the reset script
resetUserData()
  .then(() => {
    console.log('Reset script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error executing reset script:', error);
    process.exit(1);
  }); 