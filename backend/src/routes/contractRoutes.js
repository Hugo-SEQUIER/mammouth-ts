const { interactWithContract } = require('../controllers/contractController');

async function contractRoutes(fastify) {
    fastify.post('/interactWithContract', interactWithContract);
}

module.exports = contractRoutes;