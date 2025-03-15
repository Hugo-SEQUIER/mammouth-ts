import { useCallback } from 'react';
import { getCurrentPrice, createGameState, getGameState, updateGameState } from '../api';
import { GameState } from '../interface';
import { usePublicKey } from './publicKeyContext';
// Adresse publique en dur pour le moment

// Maximum number of retry attempts
const MAX_RETRIES = 3;
// Delay between retries (in milliseconds)
const RETRY_DELAY = 2000;

export const useGameAPI = () => {
    // Récupérer le prix actuel
    const { publicKey } = usePublicKey();
    const fetchCurrentPrice = useCallback(async () => {
        try {
            const result = await getCurrentPrice();
            if (result.state === 'success') {
                console.log("fetchCurrentPrice result", result.response);
                return result.response;
            }
            throw new Error('Failed to fetch current price');
        } catch (error) {
            console.error('Error fetching current price:', error);
            return null;
        }
    }, [publicKey]);

    // Initialiser l'état du jeu pour un nouveau joueur
    const initializeGameState = useCallback(async () => {
        try {
            const result = await createGameState(publicKey);
            console.log("initializeGameState result", result);
            if (result.state === 'success') {
                return result.response;
            }
            throw new Error('Failed to initialize game state');
        } catch (error) {
            console.error('Error initializing game state:', error);
            return null;
        }
    }, [publicKey]);

    // Récupérer l'état du jeu
    const loadGameState = useCallback(async () => { 
        try {
            const result = await getGameState(publicKey);
            console.log("loadGameState result", result);
            if (result.state === 'success') {
                return result.response;
            }
            throw new Error('Failed to load game state');
        } catch (error) {
            console.error('Error loading game state:', error);
            return null;
        }
    }, [publicKey]);

    // Helper function to wait for a specified time
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Sauvegarder l'état du jeu with retry logic
    const saveGameState = useCallback(async (gameState: GameState) => {
        let retries = 0;
        
        while (retries < MAX_RETRIES) {
            try {
                const result = await updateGameState(publicKey, gameState);
                if (result.state === 'success') {
                    return true;
                }
                throw new Error('Failed to save game state');
            } catch (error) {
                retries++;
                console.error(`Error saving game state (attempt ${retries}/${MAX_RETRIES}):`, error);
                
                if (retries >= MAX_RETRIES) {
                    console.error('Max retries reached. Failed to save game state.');
                    return false;
                }
                
                // Wait before retrying
                await wait(RETRY_DELAY);
            }
        }
        
        return false;
    }, [publicKey]);

    return {
        fetchCurrentPrice,
        initializeGameState,
        loadGameState,
        saveGameState
    };
};