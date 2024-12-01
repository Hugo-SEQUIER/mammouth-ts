const { updateCurrentPrice, getCurrentPrice, updateLaikaPrice } = require('../controllers/quoteController');

async function quoteRoutes(fastify) {
    fastify.post('/updateCurrentPrice', updateCurrentPrice);
    fastify.post('/getCurrentPrice', getCurrentPrice);
    fastify.post('/updateLaikaPrice', updateLaikaPrice);
}

module.exports = quoteRoutes;