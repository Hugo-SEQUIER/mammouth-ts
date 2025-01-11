const { supabase } = require('../utils/supabaseClient');
const { encryptResponse, decryptResponse } = require('../utils/encryption');
const { databaseLogger } = require('../utils/logger');

const createGameState = async (request, reply) => {
    const { userPublicKey } = request.body;
    const initialState = {
        basicInfo: {
            ice: 0,
            icePerClick: 1,
            icePerSecond: 0,
            money: 0,
            nbClickAllowed: 0,
        },
        items: {
            pickaxe: {
                level: 0,
                upgradeCost: 10,
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
    }

    const { data, error } = await supabase
        .from('game_states')
        .insert({ user_public_key: userPublicKey, state: initialState });
    
    if (error) {
        databaseLogger.error(`Error creating game state for user ${userPublicKey}: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error creating game state')
        };
    }
    console.log("data", data);
    return {
        state: 'success',
        response: encryptResponse(initialState)
    };
}

const getDatabaseData = async (request, reply) => {
    const { userPublicKey } = request.body;

    const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_public_key', userPublicKey)
        .single();
    if (!data) {
        return {
            state: 'success',
            response: encryptResponse("No game state found")
        };
    }
    if (error) {
        databaseLogger.error(`Error fetching game state for user ${userPublicKey}: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error fetching game state')
        };
    }

    return {
        state: 'success',
        response: encryptResponse(data)
    };
}

const updateDatabaseData = async (request, reply) => {
    const { userPublicKey, gameState } = request.body;

    const { data, error } = await supabase
        .from('game_states')
        .update({ state: gameState })
        .eq('user_public_key', userPublicKey);

    if (error) {
        databaseLogger.error(`Error updating game state for user ${userPublicKey}: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error updating game state')
        };
    }

    return {
        state: 'success',
        response: encryptResponse('Game state updated')
    };
}

module.exports = {
    getDatabaseData,
    updateDatabaseData,
    createGameState
}

