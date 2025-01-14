import CryptoJS from 'crypto-js';
import { getConfig } from '../config';

const SECRET_KEY : string = "fqfeqfoijfefiqplle652ffefesjkejfjl441511541zdzdsd";

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
