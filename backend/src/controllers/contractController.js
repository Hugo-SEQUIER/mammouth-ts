const { encryptResponse, decryptResponse } = require('../utils/encryption');
const { main } = require('../utils/clientEclipse');
const { contractLogger } = require('../utils/logger');

const interactWithContract = async (request, reply) => {
    try {
        const tx = await main();
        contractLogger.info(`Transaction successful: ${tx}`);
        return {
            state: 'success',
            response: encryptResponse(tx)
        };
    } catch (error) {
        contractLogger.error(`Error interacting with contract: ${error.message}`);
        return {
            state: 'error',
            response: encryptResponse('Error interacting with contract')
        };
    }
}

module.exports = {
    interactWithContract
}
