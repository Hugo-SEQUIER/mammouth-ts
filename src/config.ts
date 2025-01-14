interface EnvConfig {
    REACT_APP_API_URL: string;
    REACT_APP_API_KEY: string;
    REACT_APP_RESPONSE_SECRET_KEY: string;
}

declare global {
    interface Window {
        ENV: EnvConfig;
    }
}

export const getConfig = () => {
    // En développement
    if (process.env.NODE_ENV === 'development') {
        return {
            REACT_APP_API_URL: process.env.REACT_APP_API_URL,
            REACT_APP_API_KEY: process.env.REACT_APP_API_KEY,
            REACT_APP_RESPONSE_SECRET_KEY: process.env.REACT_APP_RESPONSE_SECRET_KEY
        };
    }
    
    // In production, ensure API URL uses the same protocol as the frontend
    const config = window.ENV;
    if (window.location.protocol === 'https:' && config.REACT_APP_API_URL.startsWith('http:')) {
        config.REACT_APP_API_URL = config.REACT_APP_API_URL.replace('http:', 'https:');
    }
    
    return config;
};