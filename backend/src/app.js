const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
require('dotenv').config();

fastify.register(helmet);
fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
});

const { decryptResponse } = require('./utils/encryption');

// API Key middleware
const validateApiKey = async (request, reply) => {
    const apiKeyRequest = decryptResponse(request.headers['x-api-key']);
    if (apiKeyRequest.state == 'error') {
        reply.code(401).send({ error: 'Unauthorized - Invalid API Key' });
    }
    const apiKey = apiKeyRequest.response;
    if (!apiKey || apiKey !== process.env.API_KEY) {
      reply.code(401).send({ error: 'Unauthorized - Invalid API Key' });
    }
};

const databaseRoutes = require('./routes/databaseRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const contractRoutes = require('./routes/contractRoutes');

fastify.register(async function (fastify) {
    fastify.addHook('preHandler', validateApiKey);
    fastify.register(databaseRoutes, { prefix: '/database' });
    fastify.register(quoteRoutes, { prefix: '/quote' });
    fastify.register(contractRoutes, { prefix: '/contract' });
});

fastify.get('/', async (request, reply) => {
    return 'Welcome to the Backend API';
});

// Error Handler
fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.status(500).send({ error: 'Something went wrong!' });
});


const { updateCurrentPrice, updateLaikaPrice } = require('./controllers/quoteController');

// Start Server
const start = async () => {
    try {
        const PORT = process.env.PORT || 5000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        await updateCurrentPrice();
        // Set interval to refresh cache every 5 minutes
        setInterval(updateCurrentPrice, 5 * 60 * 1000);

        await updateLaikaPrice();
        // Set interval to refresh cache every 24 hours
        setInterval(updateLaikaPrice, 24 * 60 * 60 * 1000);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
