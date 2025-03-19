const { supabase } = require('../utils/supabaseClient');

const migrateData = async () => {
  console.log('Début de la migration des données...');
  
  // Récupérer tous les états de jeu
  const { data: gameStates, error: fetchError } = await supabase
    .from('game_states')
    .select('*');
  
  if (fetchError) {
    console.error('Erreur lors de la récupération des données:', fetchError);
    return;
  }
  
  console.log(`Migration de ${gameStates.length} utilisateurs...`);
  
  // Pour chaque utilisateur, migrer les données
  for (const gameState of gameStates) {
    const userPublicKey = gameState.user_public_key;
    const state = gameState.state;
    
    try {
      // Vérifier si l'utilisateur existe déjà dans la nouvelle structure
      const { data: existingUser } = await supabase
        .from('users')
        .select('user_public_key')
        .eq('user_public_key', userPublicKey)
        .single();
      
      // Si l'utilisateur n'existe pas, le créer
      if (!existingUser) {
        await supabase.from('users').insert({
          user_public_key: userPublicKey,
          created_at: gameState.created_at || new Date().toISOString(),
          last_login: gameState.last_login || new Date().toISOString()
        });
      }
      
      // Insérer dans la table basic_info
      await supabase.from('basic_info').upsert({
        user_public_key: userPublicKey,
        ice: state.basicInfo?.ice || 0,
        ice_per_click: state.basicInfo?.icePerClick || 1,
        ice_per_second: state.basicInfo?.icePerSecond || 0,
        money: state.basicInfo?.money || 0,
        nb_click: state.basicInfo?.nbClick || 0,
        nb_click_allowed: state.basicInfo?.nbClickAllowed || 0
      });
      
      // Insérer dans la table items
      await supabase.from('items').upsert({
        user_public_key: userPublicKey,
        pickaxe_level: state.items?.pickaxe?.level || 1,
        pickaxe_upgrade_cost: state.items?.pickaxe?.upgradeCost || 10,
        gloves_level: state.items?.gloves?.level || 1,
        gloves_upgrade_cost: state.items?.gloves?.upgradeCost || 100,
        user_level: state.items?.userLevel || 1,
        cost_upgrade: state.items?.costUpgrade || 100
      });
      
      // Insérer dans la table company
      await supabase.from('company').upsert({
        user_public_key: userPublicKey,
        level: state.company?.level || 0,
        upgrade_cost: state.company?.upgradeCost || 100,
        reputation: state.company?.reputation || 0,
        cash_flow: state.company?.cashFlow || 0
      });
      
      // Insérer dans la table market
      await supabase.from('market').upsert({
        user_public_key: userPublicKey,
        market_price: state.market?.marketPrice || 1,
        user_price: state.market?.userPrice || 1,
        public_demand: state.market?.publicDemand || 0,
        ice_sell: state.market?.iceSell || 0
      });
      
      // Insérer dans la table laboratory
      await supabase.from('laboratory').upsert({
        user_public_key: userPublicKey,
        level: state.laboratory?.level || 0,
        upgrade_cost: state.laboratory?.upgradeCost || 1000,
        search_cost: state.laboratory?.searchCost || 10,
        research_speed: state.laboratory?.researchSpeed || 1
      });
      
      // Insérer dans la table shop
      await supabase.from('shop').upsert({
        user_public_key: userPublicKey,
        energy_bar_price: state.shop?.energyBar?.price || 50,
        energy_bar_is_active: state.shop?.energyBar?.isActive || false,
        energy_bar_boost: state.shop?.energyBar?.boost || 1.15
      });
      
      // Migrer les employés
      if (state.company?.employees && Array.isArray(state.company.employees)) {
        for (const employee of state.company.employees) {
          await supabase.from('employees').insert({
            user_public_key: userPublicKey,
            job: employee.job,
            amount: employee.amount || 0,
            salary: employee.salary || 0,
            happiness: employee.happiness || 0,
            production: employee.production || 0
          });
        }
      }
      
      // Migrer les recherches
      if (state.laboratory?.researchQueue && Array.isArray(state.laboratory.researchQueue)) {
        for (const research of state.laboratory.researchQueue) {
            try {
                await supabase.from('research').insert({
                    user_public_key: userPublicKey,
                    name: research.name,
                    cost: research.cost || 0,
                    effect: research.effect || 0,
                    category: research.category || 'Production',
                    description: research.description || '',
                    research_time: research.researchTime || 0,
                    prerequisites: research.prerequisites || [],
                    status: 'queue',
                });
            } catch (error) {
                console.error(`Erreur lors de la migration pour l'utilisateur ${userPublicKey}:`, error);
            }
        }
      }
    //   console.log("state.laboratory.researchDone", state.laboratory.researchDone);
    //   console.log("state.laboratory.researchQueue", state.laboratory.researchQueue);
      if (state.laboratory?.researchDone && Array.isArray(state.laboratory.researchDone)) {
        for (const research of state.laboratory.researchDone) {
            console.log("research", research);
            try {
                const { data, error } = await supabase.from('research').insert({
                    user_public_key: userPublicKey,
                    name: research.name,
                    cost: research.cost || 0,
                    effect: research.effect || 0,
                    category: research.category || 'Production',
                    description: research.description || '',
                    research_time: research.researchTime || 0,
                    prerequisites: research.prerequisites || [],
                    status: 'done',
                });
                if (error) {
                    console.error(`Erreur lors de la migration pour l'utilisateur ${userPublicKey}:`, error);
                }
            } catch (error) {
                console.error(`Erreur lors de la migration pour l'utilisateur ${userPublicKey}:`, error);
            }
        }
      }
      
      
      // Migrer les investissements
      if (state.investment) {
        for (const investment of Object.keys(state.investment)) {
            try {
                await supabase.from('investments').insert({
                    user_public_key: userPublicKey,
                    type: investment,
                    amount: state.investment[investment].amount || 0,
                    avg_buy_price: state.investment[investment].avgBuyPrice || 0,
                    actual_price: state.investment[investment].actualPrice || 0
                });
            } catch (error) {
                console.error(`Erreur lors de la migration pour l'utilisateur ${userPublicKey}:`, error);
            }
        }
      }
          
      // Migrer les achievements
      if (state.achievements && Array.isArray(state.achievements)) {
        for (const achievement of state.achievements) {
          await supabase.from('achievements').insert({
            user_public_key: userPublicKey,
            name: achievement.name,
            unlocked_at: achievement.unlockedAt || new Date().toISOString()
          });
        }
      }
      
     console.log(`Migration réussie pour l'utilisateur: ${userPublicKey}`);
    } catch (error) {
      console.error(`Erreur lors de la migration pour l'utilisateur ${userPublicKey}:`, error);
    }
  }
  
  console.log('Migration terminée!');
};

// Exécuter la migration
migrateData()
  .then(() => {
    console.log('Script de migration terminé avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur lors de l\'exécution du script de migration:', error);
    process.exit(1);
  }); 