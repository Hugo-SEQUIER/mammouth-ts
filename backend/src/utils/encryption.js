const CryptoJS = require('crypto-js');
const SECRET_KEY = process.env.SECRET_KEY;
const encryptResponse = (data) => {
    const textToEncrypt = typeof data === 'object' ? JSON.stringify(data) : data.toString();
    return CryptoJS.AES.encrypt(textToEncrypt, SECRET_KEY).toString();
};

const decryptResponse = (cipherText) => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        
        // Try to parse as JSON, if it fails return as plain text
        try {
            return {
                state: 'success',
                response: JSON.parse(decryptedText)
            };
        } catch {
            return {
                state: 'success',
                response: decryptedText
            };
        }
    } catch (error) {
        console.error('Decryption failed:', error);
        return {
            state: 'error',
            response: 'Decryption Error'
        };
    }
};

module.exports = {
    encryptResponse,
    decryptResponse
}
