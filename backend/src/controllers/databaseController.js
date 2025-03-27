const { supabase } = require('../utils/supabaseClient');
const { encryptResponse, decryptResponse } = require('../utils/encryption');
const { databaseLogger } = require('../utils/logger');

// Fonction pour convertir les données de la nouvelle structure vers l'ancienne structure
const convertToOldFormat = async (userPublicKey) => {
    try {
        // Récupérer toutes les données de l'utilisateur depuis les différentes tables
        const [
            basicInfoResult,
            itemsResult,
            companyResult,
            marketResult,
            laboratoryResult,
            shopResult,
            employeesResult,
            researchResult,
            investmentsResult,
        ] = await Promise.all([
            supabase.from('basic_info').select('*').eq('user_public_key', userPublicKey).single(),
            supabase.from('items').select('*').eq('user_public_key', userPublicKey).single(),
            supabase.from('company').select('*').eq('user_public_key', userPublicKey).single(),
            supabase.from('market').select('*').eq('user_public_key', userPublicKey).single(),
            supabase.from('laboratory').select('*').eq('user_public_key', userPublicKey).single(),
            supabase.from('shop').select('*').eq('user_public_key', userPublicKey).single(),
            supabase.from('employees').select('*').eq('user_public_key', userPublicKey),
            supabase.from('research').select('*').eq('user_public_key', userPublicKey),
            supabase.from('investments').select('*').eq('user_public_key', userPublicKey),
        ]);

        // Construire l'objet d'état du jeu au format attendu par le frontend
        const gameState = {
            basicInfo: {
                ice: basicInfoResult.data?.ice || 0,
                icePerClick: basicInfoResult.data?.ice_per_click || 1,
                icePerSecond: basicInfoResult.data?.ice_per_second || 0,
                money: basicInfoResult.data?.money || 0,
                nbClick: basicInfoResult.data?.nb_click || 0,
                nbClickAllowed: basicInfoResult.data?.nb_click_allowed || 0
            },
            items: {
                pickaxe: {
                    level: itemsResult.data?.pickaxe_level || 1,
                    upgradeCost: itemsResult.data?.pickaxe_upgrade_cost || 10
                },
                gloves: {
                    level: itemsResult.data?.gloves_level || 1,
                    upgradeCost: itemsResult.data?.gloves_upgrade_cost || 100
                },
                userLevel: itemsResult.data?.user_level || 1,
                costUpgrade: itemsResult.data?.cost_upgrade || 100
            },
            company: {
                level: companyResult.data?.level || 0,
                upgradeCost: companyResult.data?.upgrade_cost || 100,
                reputation: companyResult.data?.reputation || 0,
                cashFlow: companyResult.data?.cash_flow || 0,
                employees: employeesResult.data?.map(emp => ({
                    job: emp.job,
                    amount: emp.amount,
                    salary: emp.salary,
                    happiness: emp.happiness,
                    production: emp.production
                })) || [],
                investments: []
            },
            market: {
                marketPrice: marketResult.data?.market_price || 1,
                userPrice: marketResult.data?.user_price || 1,
                publicDemand: marketResult.data?.public_demand || 0,
                iceSell: marketResult.data?.ice_sell || 0
            },
            laboratory: {
                level: laboratoryResult.data?.level || 0,
                upgradeCost: laboratoryResult.data?.upgrade_cost || 1000,
                searchCost: laboratoryResult.data?.search_cost || 10,
                researchSpeed: laboratoryResult.data?.research_speed || 1,
                researchQueue: researchResult.data?.filter(res => res.status === 'queue').map(res => ({
                    name: res.name,
                    cost: res.cost || 0,
                    effect: res.effect || 0,
                    category: res.category || 'Production',
                    description: res.description || '',
                    research_time: res.researchTime || 0,
                    prerequisites: res.prerequisites || [],
                })) || [],
                researchDone: researchResult.data?.filter(res => res.status === 'done').map(res => ({
                    name: res.name,
                    cost: res.cost || 0,
                    effect: res.effect || 0,
                    category: res.category || 'Production',
                    description: res.description || '',
                    research_time: res.researchTime || 0,
                    prerequisites: res.prerequisites || [],
                })) || [],
                employees: []
            },
            shop: {
                energyBar: {
                    price: shopResult.data?.energy_bar_price || 50,
                    isActive: shopResult.data?.energy_bar_is_active || false,
                    boost: shopResult.data?.energy_bar_boost || 1.15
                }
            },
            investment: {
                bitcoin: {
                    amount: 0,
                    avgBuyPrice: 0,
                    actualPrice: 96000
                },
                ethereum: {
                    amount: 0,
                    avgBuyPrice: 0,
                    actualPrice: 3400
                },
                spy: {
                    amount: 0,
                    avgBuyPrice: 0,
                    actualPrice: 5900
                },
                laika: {
                    amount: 0,
                    avgBuyPrice: 0,
                    actualPrice: 1
                }
            },
            achievements: []
        };

        // Traiter les investissements
        if (investmentsResult.data && investmentsResult.data.length > 0) {
            for (const inv of investmentsResult.data) {
                if (inv.type.toLowerCase() === 'bitcoin') {
                    gameState.investment.bitcoin = {
                        amount: inv.amount,
                        avgBuyPrice: inv.avg_buy_price,
                        actualPrice: inv.actual_price
                    };
                } else if (inv.type.toLowerCase() === 'ethereum') {
                    gameState.investment.ethereum = {
                        amount: inv.amount,
                        avgBuyPrice: inv.avg_buy_price,
                        actualPrice: inv.actual_price
                    };
                } else if (inv.type.toLowerCase() === 'spy') {
                    gameState.investment.spy = {
                        amount: inv.amount,
                        avgBuyPrice: inv.avg_buy_price,
                        actualPrice: inv.actual_price
                    };
                } else if (inv.type.toLowerCase() === 'laika') {
                    gameState.investment.laika = {
                        amount: inv.amount,
                        avgBuyPrice: inv.avg_buy_price,
                        actualPrice: inv.actual_price
                    };
                }
            }
        }

        return gameState;
    } catch (error) {
        console.error('Erreur lors de la conversion des données:', error);
        return null;
    }
};

// Fonction pour sauvegarder les données dans la nouvelle structure
const saveToNewFormat = async (userPublicKey, gameState) => {
    try {
        // Vérifier si l'utilisateur existe
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('user_public_key')
            .eq('user_public_key', userPublicKey)
            .single();

        if (userError) {
            // Créer l'utilisateur s'il n'existe pas
            await supabase.from('users').insert({
                user_public_key: userPublicKey,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            });
        } else {
            // Mettre à jour la date de dernière connexion
            await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('user_public_key', userPublicKey);
        }

        // Mettre à jour les informations de base
        await supabase.from('basic_info').upsert({
            user_public_key: userPublicKey,
            ice: gameState.basicInfo?.ice || 0,
            ice_per_click: gameState.basicInfo?.icePerClick || 1,
            ice_per_second: gameState.basicInfo?.icePerSecond || 0,
            money: gameState.basicInfo?.money || 0,
            nb_click: gameState.basicInfo?.nbClick || 0,
            nb_click_allowed: gameState.basicInfo?.nbClickAllowed || 0
        });

        // Mettre à jour les items
        await supabase.from('items').upsert({
            user_public_key: userPublicKey,
            pickaxe_level: gameState.items?.pickaxe?.level || 1,
            pickaxe_upgrade_cost: gameState.items?.pickaxe?.upgradeCost || 10,
            gloves_level: gameState.items?.gloves?.level || 1,
            gloves_upgrade_cost: gameState.items?.gloves?.upgradeCost || 100,
            user_level: gameState.items?.userLevel || 1,
            cost_upgrade: gameState.items?.costUpgrade || 100
        });

        // Mettre à jour la compagnie
        await supabase.from('company').upsert({
            user_public_key: userPublicKey,
            level: gameState.company?.level || 0,
            upgrade_cost: gameState.company?.upgradeCost || 100,
            reputation: gameState.company?.reputation || 0,
            cash_flow: gameState.company?.cashFlow || 0
        });

        // Mettre à jour le marché
        await supabase.from('market').upsert({
            user_public_key: userPublicKey,
            market_price: gameState.market?.marketPrice || 1,
            user_price: gameState.market?.userPrice || 1,
            public_demand: gameState.market?.publicDemand || 0,
            ice_sell: gameState.market?.iceSell || 0
        });

        // Mettre à jour le laboratoire
        await supabase.from('laboratory').upsert({
            user_public_key: userPublicKey,
            level: gameState.laboratory?.level || 0,
            upgrade_cost: gameState.laboratory?.upgradeCost || 1000,
            search_cost: gameState.laboratory?.searchCost || 10,
            research_speed: gameState.laboratory?.researchSpeed || 1
        });

        // Mettre à jour la boutique
        await supabase.from('shop').upsert({
            user_public_key: userPublicKey,
            energy_bar_price: gameState.shop?.energyBar?.price || 50,
            energy_bar_is_active: gameState.shop?.energyBar?.isActive || false,
            energy_bar_boost: gameState.shop?.energyBar?.boost || 1.15
        });

        // Gérer les employés (supprimer puis réinsérer)
        if (gameState.company?.employees && Array.isArray(gameState.company.employees)) {
            await supabase.from('employees').delete().eq('user_public_key', userPublicKey);

            if (gameState.company.employees.length > 0) {
                const employeesData = gameState.company.employees.map(emp => ({
                    user_public_key: userPublicKey,
                    job: emp.job,
                    amount: emp.amount || 0,
                    salary: emp.salary || 0,
                    happiness: emp.happiness || 0,
                    production: emp.production || 0
                }));

                await supabase.from('employees').insert(employeesData);
            }
        }

        // Gérer les recherches
        await supabase.from('research').delete().eq('user_public_key', userPublicKey);

        // Ajouter les recherches en cours
        if (gameState.laboratory?.researchQueue && Array.isArray(gameState.laboratory.researchQueue)) {
            if (gameState.laboratory.researchQueue.length > 0) {
                console.log("gameState.laboratory.researchQueue", gameState.laboratory.researchQueue);
                gameState.laboratory.researchQueue.map(async (res) => {
                    await supabase.from('research').insert({
                    user_public_key: userPublicKey,
                    name: res.name,
                    cost: res.cost || 0,
                    effect: res.effect || 0,
                    category: res.category || 'Production',
                    description: res.description || '',
                    research_time: res.researchTime || 0,
                    prerequisites: res.prerequisites || [],
                    status: 'queue',
                })});
            }
        }

        // Ajouter les recherches terminées
        if (gameState.laboratory?.researchDone && Array.isArray(gameState.laboratory.researchDone)) {
            if (gameState.laboratory.researchDone.length > 0) {
                const researchDoneData = gameState.laboratory.researchDone.map(res => ({
                    user_public_key: userPublicKey,
                    name: res.name,
                    cost: res.cost || 0,
                    effect: res.effect || 0,
                    category: res.category || 'Production',
                    description: res.description || '',
                    research_time: res.researchTime || 0,
                    prerequisites: res.prerequisites || [],
                    status: 'done',
                }));

                await supabase.from('research').insert(researchDoneData);
            }
        }

        // Gérer les investissements
        await supabase.from('investments').delete().eq('user_public_key', userPublicKey);

        // Ajouter les investissements
        const investmentsToAdd = [];
        
        if (gameState.investment?.bitcoin && gameState.investment.bitcoin.amount > 0) {
            investmentsToAdd.push({
                user_public_key: userPublicKey,
                type: 'bitcoin',
                amount: gameState.investment.bitcoin.amount,
                avg_buy_price: gameState.investment.bitcoin.avgBuyPrice,
                actual_price: gameState.investment.bitcoin.actualPrice
            });
        }
        
        if (gameState.investment?.ethereum && gameState.investment.ethereum.amount > 0) {
            investmentsToAdd.push({
                user_public_key: userPublicKey,
                type: 'ethereum',
                amount: gameState.investment.ethereum.amount,
                avg_buy_price: gameState.investment.ethereum.avgBuyPrice,
                actual_price: gameState.investment.ethereum.actualPrice
            });
        }
        
        if (gameState.investment?.spy && gameState.investment.spy.amount > 0) {
            investmentsToAdd.push({
                user_public_key: userPublicKey,
                type: 'spy',
                amount: gameState.investment.spy.amount,
                avg_buy_price: gameState.investment.spy.avgBuyPrice,
                actual_price: gameState.investment.spy.actualPrice
            });
        }
        
        if (gameState.investment?.laika && gameState.investment.laika.amount > 0) {
            investmentsToAdd.push({
                user_public_key: userPublicKey,
                type: 'laika',
                amount: gameState.investment.laika.amount,
                avg_buy_price: gameState.investment.laika.avgBuyPrice,
                actual_price: gameState.investment.laika.actualPrice
            });
        }
        
        if (investmentsToAdd.length > 0) {
            await supabase.from('investments').insert(investmentsToAdd);
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
        return false;
    }
};

// Fonction pour créer un nouvel état de jeu
const createGameState = async (request, reply) => {
    const { userPublicKey } = request.body;
    const initialState = {
        basicInfo: {
            ice: 0,
            icePerClick: 1,
            icePerSecond: 0,
            money: 0,
            nbClick: 0,
            nbClickAllowed: 0,
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
                actualPrice: 5900,
            },
            laika: {
                amount: 0,
                avgBuyPrice: 0,
                actualPrice: 1,
            }
        }
    };

    try {
        // Créer l'utilisateur dans la nouvelle structure
        await supabase.from('users').insert({
            user_public_key: userPublicKey,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
        });

        await supabase.from('invariantbonus').insert({
            user_public_key: userPublicKey,
            last_updated: new Date()
        });

        // Sauvegarder l'état initial dans la nouvelle structure
        const success = await saveToNewFormat(userPublicKey, initialState);

        if (!success) {
            databaseLogger.error(`Error creating game state for user ${userPublicKey}`);
            return {
                state: 'error',
                response: encryptResponse('Error creating game state')
            };
        }

        return {
            state: 'success',
            response: encryptResponse(initialState)
        };
    } catch (error) {
        databaseLogger.error(`Error creating game state for user ${userPublicKey}: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error creating game state')
        };
    }
};

// Fonction pour récupérer l'état du jeu
const getDatabaseData = async (request, reply) => {
    const { userPublicKey } = request.body;

    try {
        // Vérifier si l'utilisateur existe
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('user_public_key')
            .eq('user_public_key', userPublicKey)
            .single();

        if (userError) {
            return {
                state: 'success',
                response: encryptResponse("No game state found")
            };
        }

        // Convertir les données de la nouvelle structure vers l'ancienne structure
        const gameState = await convertToOldFormat(userPublicKey);

        if (!gameState) {
            return {
                state: 'success',
                response: encryptResponse("No game state found")
            };
        }

        // Créer un objet qui ressemble à l'ancien format de réponse
        const responseData = {
            user_public_key: userPublicKey,
            state: gameState,
            created_at: user.created_at || new Date().toISOString()
        };

        return {
            state: 'success',
            response: encryptResponse(responseData)
        };
    } catch (error) {
        databaseLogger.error(`Error fetching game state for user ${userPublicKey}: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error fetching game state')
        };
    }
};

// Fonction pour mettre à jour l'état du jeu
const updateDatabaseData = async (request, reply) => {
    const { userPublicKey, gameState } = request.body;

    try {
        // Sauvegarder les données dans la nouvelle structure
        const success = await saveToNewFormat(userPublicKey, gameState);

        if (!success) {
            databaseLogger.error(`Error updating game state for user ${userPublicKey}`);
            return {
                state: 'error',
                response: encryptResponse('Error updating game state')
            };
        }

        return {
            state: 'success',
            response: encryptResponse('Game state updated')
        };
    } catch (error) {
        databaseLogger.error(`Error updating game state for user ${userPublicKey}: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error updating game state')
        };
    }
};

// Fonction pour récupérer tous les états de jeu
const getAllData = async () => {
    try {
        // Récupérer tous les utilisateurs
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('user_public_key');

        if (usersError) {
            databaseLogger.error(`Error fetching all users: ${usersError.message}`);
            return {
                state: 'error',
                response: encryptResponse('Error fetching all game states')
            };
        }

        // Récupérer l'état du jeu pour chaque utilisateur
        const gameStates = [];
        for (const user of users) {
            const gameState = await convertToOldFormat(user.user_public_key);
            if (gameState) {
                gameStates.push({
                    user_public_key: user.user_public_key,
                    state: gameState
                });
            }
        }
        console.log("gameStates", gameStates);
        return {
            state: 'success',
            response: encryptResponse(gameStates)
        };
    } catch (error) {
        databaseLogger.error(`Error fetching all game states: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error fetching all game states')
        };
    }
};

// Fonction pour récupérer le classement
const getLeaderboard = async (request, reply) => {
    try {
        const { data, error } = await supabase
            .from('basic_info')
            .select('user_public_key, ice, nb_click');
        if (error) {
            return {
                state: 'error',
                response: encryptResponse("No Leaderboard found")
            };
        }
        const filteredLeaderboard = filterData(data);
        return {
            state: 'success',
            response: encryptResponse(filteredLeaderboard)
        };
    } catch (error) {
        databaseLogger.error(`Error fetching leaderboard: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error fetching leaderboard')
        };
    }
};

// Fonction pour filtrer les données du classement
const filterData = (data) => {
    const filteredData = data
        .filter(item => item.ice >= 0)
        .filter(item => item.user_public_key != "DJi9qeHDT5vpu1iKApVvPxfBa7UYdSkuMPPsZ97zxvSc")
        .sort((a, b) => b.ice - a.ice)
        .map(item => ({
            userPublicKey: item.user_public_key,
            ice: item.ice.toFixed(2) || 0,
            nbClick: item.nb_click,
        }));

    return filteredData;
};

// Fonction pour récupérer les utilisateurs ayant un bonus invariant
const getInvariantBonus = async (userPublicKey) => {
    const { data, error } = await supabase
        .from('invariantbonus')
        .select('user_public_key, last_updated')
        .eq('user_public_key', userPublicKey)
        .single();
    if (error) {
        return null;
    }
    return data;
};

// Fonction pour distribuer des bonus aux utilisateurs d'Invariant
const bonusInvariant = async () => {
    try {
        const invariantResult = await fetch("https://points.invariant.app/api/eclipse-mainnet/total/null?size=3000");
        const invariantData = await invariantResult.json();
        
        for (const user of invariantData.leaderboard) {
            const invariantBonus = await getInvariantBonus(user.address);
            if (invariantBonus == null) {
                continue;
            }

            const lastUpdated = new Date(invariantBonus.last_updated);
            const twentyFourHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

            if (lastUpdated >= twentyFourHoursAgo) {
                continue; // Skip if less than 24 hours since last update
            }

            try {
                // Vérifier si l'utilisateur existe
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('user_public_key')
                    .eq('user_public_key', user.address)
                    .single();

                if (userError) {
                    continue; // Utilisateur non trouvé, passer au suivant
                }

                // Récupérer les informations de base
                const { data: basicInfo, error: basicInfoError } = await supabase
                    .from('basic_info')
                    .select('ice')
                    .eq('user_public_key', user.address)
                    .single();

                if (basicInfoError) {
                    continue; // Informations de base non trouvées, passer au suivant
                }

                // Ajouter 150 ice et mettre à jour la date
                await Promise.all([
                    supabase
                        .from('basic_info')
                        .update({ ice: basicInfo.ice + 150 })
                        .eq('user_public_key', user.address),
                    supabase
                        .from('invariantbonus')
                        .update({ last_updated: new Date() })
                        .eq('user_public_key', user.address)
                ]);

            } catch (error) {
                databaseLogger.error(`Error processing game state for user ${user.address}: ${error.message}`);
            }
        }
    } catch (error) {
        databaseLogger.error(`Error in bonusInvariant: ${error.message}`);
    }
};

module.exports = {
    getDatabaseData,
    updateDatabaseData,
    createGameState,
    getLeaderboard,
    bonusInvariant
};

