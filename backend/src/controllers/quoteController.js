const { supabase } = require('../utils/supabaseClient');
const { quoteLogger } = require('../utils/logger');
const { encryptResponse } = require('../utils/encryption');
async function getQuote(symbol) {
    const quote = await getQuoteFromFinnhub(symbol);
    quoteLogger.info(`Quote for ${symbol}: ${quote.c}`);
    return quote.c;
}

async function getQuoteFromFinnhub(symbol) {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
    const data = await response.json();
    return data;
}

async function getAllCurrentPrice(){
    const currencySymbol = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'SPY']
    const currencyPrice = await Promise.all(currencySymbol.map(symbol => getQuote(symbol)));
    return currencyPrice;
}

async function updateCurrentPrice(){
    const currencyPrice = await getAllCurrentPrice();
    const currencySymbol = ['Bitcoin', 'Ethereum', 'SPY']
    for (let i = 0; i < currencySymbol.length; i++) {
        const { data, error } = await supabase
            .from('quotes')
            .update({ current_price: currencyPrice[i] })
            .eq('symbol', currencySymbol[i]);
        if (error) {
            quoteLogger.error(`Error updating current price for ${currencySymbol[i]}: ${error}`);
        }
    }
    return;
}

async function updateLaikaPrice(){
    const { data, error:errorGet } = await supabase
        .from('quotes')
        .select('*')
        .eq('symbol', "Laika")
        .single();
    if (errorGet) {
        quoteLogger.error(`Error fetching current price for Laika: ${errorGet}`);
    }
    const awaitUpdate = data.current_price*2;
    const { _, error } = await supabase
        .from('quotes')
        .update({ current_price: awaitUpdate })
        .eq('symbol', 'Laika');
    if (error) {
        quoteLogger.error(`Error updating current price for Laika: ${error}`);
    }
}
async function getCurrentPrice(){
    const { data, error } = await supabase
        .from('quotes')
        .select('*');
    if (error) {
        quoteLogger.error(`Error fetching current price: ${error}`);
        return {
            state: 'error',
            response: encryptResponse('Error fetching current price')
        };
    }
    return {
        state: 'success',
        response: encryptResponse(data)
    };
}
module.exports = {
    getQuote,
    updateCurrentPrice,
    getCurrentPrice,
    updateLaikaPrice
}

