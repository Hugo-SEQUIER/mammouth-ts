const { getDatabaseData, updateDatabaseData, createGameState } = require('../controllers/databaseController');

async function databaseRoutes(fastify) {
    fastify.post('/getDatabaseData', getDatabaseData);
    fastify.post('/updateDatabaseData', updateDatabaseData);
    fastify.post('/createGameState', createGameState);
}

module.exports = databaseRoutes;