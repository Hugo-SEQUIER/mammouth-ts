import CryptoJS from 'crypto-js';

const SECRET_KEY : string = process.env.REACT_APP_RESPONSE_SECRET_KEY || '';

const encryptResponse = (data: any) => {
    const textToEncrypt = typeof data === 'object' ? JSON.stringify(data) : data;
    return CryptoJS.AES.encrypt(textToEncrypt, SECRET_KEY).toString();
};

const decryptResponse = (cipherText: any) => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
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

export { encryptResponse, decryptResponse };
