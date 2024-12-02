import { useCallback } from 'react';
import { getCurrentPrice, createGameState, getGameState, updateGameState } from '../api';
import { GameState } from '../interface';
import { usePublicKey } from './publicKeyContext';
// Adresse publique en dur pour le moment

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

    // Sauvegarder l'état du jeu
    const saveGameState = useCallback(async (gameState: GameState) => {
        try {
            const result = await updateGameState(publicKey, gameState);
            if (result.state === 'success') {
                return true;
            }
            throw new Error('Failed to save game state');
        } catch (error) {
            console.error('Error saving game state:', error);
            return false;
        }
    }, [publicKey]);

    return {
        fetchCurrentPrice,
        initializeGameState,
        loadGameState,
        saveGameState
    };
};