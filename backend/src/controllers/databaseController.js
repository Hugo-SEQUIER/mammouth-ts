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

const getAllData = async () => {
    const { data, error } = await supabase
        .from('game_states')
        .select('*')

    if (error) {
        databaseLogger.error(`Error fetching all game states: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error fetching all game states')
        };
    }

    return {
        state: 'success',
        response: encryptResponse(data)
    };
}

const filterData = (data) => {
    if (data.state != "success"){
        return {
            state: 'error',
            response: encryptResponse("No Leaderboard found")
        };
    }
    const filteredData = data.response
        .filter(item => item.state.basicInfo.ice >= 0)
        .filter(item => item.user_public_key != "DJi9qeHDT5vpu1iKApVvPxfBa7UYdSkuMPPsZ97zxvSc")
        .sort((a, b) => b.state.basicInfo.ice - a.state.basicInfo.ice)
        .map(item => ({
            userPublicKey: item.user_public_key,
            ice: item.state.basicInfo.ice,
            nbClick: item.state.basicInfo.nbClick,
        }));
    return filteredData;
}

const getLeaderboard = async (request, reply) => {
    const data = await getAllData()
    if (data.state != "success"){
        return {
            state: 'error',
            response: encryptResponse("No Leaderboard found")
        };
    }
    const filteredLeaderboard = filterData(decryptResponse(data.response))
    return {
        state: 'success',
        response: encryptResponse(filteredLeaderboard)
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
    createGameState,
    getLeaderboard
}

