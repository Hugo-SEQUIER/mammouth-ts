const { getDatabaseData, updateDatabaseData, createGameState, getLeaderboard } = require('../controllers/databaseController');

async function databaseRoutes(fastify) {
    fastify.post('/getDatabaseData', getDatabaseData);
    fastify.post('/updateDatabaseData', updateDatabaseData);
    fastify.post('/createGameState', createGameState);
    fastify.post('/getLeaderboard', getLeaderboard);
}


module.exports = databaseRoutes;