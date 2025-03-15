const { supabase } = require('./supabaseClient');
const { databaseLogger } = require('./logger');

/**
 * Script to clean the database while preserving nbClickAllowed
 * This script:
 * 1. Fetches all game states from the database
 * 2. For each game state, resets it to initial values but keeps nbClickAllowed
 * 3. Updates the database with the cleaned game states
 */

// Initial game state template (copied from databaseController.js)
const getInitialState = (nbClickAllowed) => ({
  basicInfo: {
    ice: 0,
    icePerClick: 1,
    icePerSecond: 0,
    money: 0,
    nbClick: 0,
    nbClickAllowed: nbClickAllowed, // Preserve this value
  },
  items: {
    pickaxe: {
      level: 1,
      upgradeCost: 10,
    },
    gloves: {
      level: 1,
      upgradeCost: 100,
    },
    userLevel: 1,
    costUpgrade: 100,
  },
  company: {
    level: 0,
    upgradeCost: 100,
    reputation: 0,
    cashFlow: 0,
    employees: [
      {
        amount: 0,
        job: "Junior Miner",
        salary: 100,
        happiness: 0,
        production: 1,
      },
      {
        amount: 0,
        job: "Senior Miner",
        salary: 600,
        happiness: 0,
        production: 2,
      },
      {
        amount: 0,
        job: "Frost Mage",
        salary: 1500,
        happiness: 0,
        production: 3.2,
      },
      {
        amount: 0,
        job: "Yeti",
        salary: 3000,
        happiness: 0,
        production: 5,
      }
    ],
    investments: [],
  },
  laboratory: {
    level: 0,
    upgradeCost: 1000,
    searchCost: 10,
    researchSpeed: 1,
    researchQueue: [],
    researchDone: [],
    employees: [],
  },
  achievements: [],
  market: {
    marketPrice: 1,
    userPrice: 1,
    publicDemand: 0,
    iceSell: 0,
  },
  shop: {
    energyBar: {
      price: 50,
      isActive: false,
      boost: 1.15,
    },
  },
  investment: {
    bitcoin: {
      amount: 0,
      avgBuyPrice: 0,
      actualPrice: 96000,
    },
    ethereum: {
      amount: 0,
      avgBuyPrice: 0,
      actualPrice: 3400,
    },
    spy: {
      amount: 0,
      avgBuyPrice: 0,
      actualPrice: 500,
    },
    laika: {
        amount: 0,
        avgBuyPrice: 0,
        actualPrice: 1,
    }
  },
});

/**
 * Main function to clean the database
 */
const cleanDatabase = async () => {
  try {
    console.log('Starting database cleaning process...');
    
    // 1. Fetch all game states
    const { data, error } = await supabase
      .from('game_states')
      .select('*');
    
    if (error) {
      console.error('Error fetching game states:', error.message);
      return;
    }
    
    console.log(`Found ${data.length} game states to clean`);
    
    // 2. Process each game state
    let successCount = 0;
    let errorCount = 0;
    
    for (const gameStateRecord of data) {
      try {
        const userPublicKey = gameStateRecord.user_public_key;
        const currentState = gameStateRecord.state;
        
        // Extract nbClickAllowed from current state
        const nbClickAllowed = currentState?.basicInfo?.nbClickAllowed || 1;
        
        // Create new clean state with preserved nbClickAllowed
        const cleanedState = getInitialState(nbClickAllowed);
        
        // Update the database
        const { error: updateError } = await supabase
          .from('game_states')
          .update({ state: cleanedState })
          .eq('user_public_key', userPublicKey);
        
        if (updateError) {
          console.error(`Error updating game state for user ${userPublicKey}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
          console.log(`Successfully cleaned game state for user ${userPublicKey}`);
        }
      } catch (err) {
        console.error('Error processing game state:', err);
        errorCount++;
      }
    }
    
    console.log('Database cleaning completed!');
    console.log(`Successfully cleaned ${successCount} game states`);
    console.log(`Failed to clean ${errorCount} game states`);
    
  } catch (err) {
    console.error('Error in cleanDatabase function:', err);
  }
};

// Execute the script if run directly
if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log('Script execution completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Script execution failed:', err);
      process.exit(1);
    });
} else {
  // Export for use in other modules
  module.exports = {
    cleanDatabase
  };
}
