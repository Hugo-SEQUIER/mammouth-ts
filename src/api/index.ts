import { GameState } from "../interface";
import { encryptResponse, decryptResponse } from "./encryption";
import { getConfig } from "../config";

export async function getCurrentPrice(){
    const response = await fetch(`https://mammouth-ts.onrender.com/quote/getCurrentPrice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse("dev-f34bb00a492a1a506bfsfefeojfqo51dsdzd023cd4e4d9d4dfa140621d35084e15319a")
        },
        body: JSON.stringify({})
    });

    const data = await response.json();
    const decryptedData = decryptResponse(data.response);
    return {
        state: data.state,
        response: decryptedData.response
    }
}

export async function createGameState(userPublicAddress: string){
    const response = await fetch(`https://mammouth-ts.onrender.com/database/createGameState`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse("dev-f34bb00a492a1a506bfsfefeojfqo51dsdzd023cd4e4d9d4dfa140621d35084e15319a")
        },
        body: JSON.stringify({ userPublicKey: userPublicAddress })
    });

    const data = await response.json();
    const decryptedData = decryptResponse(data.response);
    return {
        state: data.state,
        response: decryptedData.response
    }
}

export async function getGameState(userPublicAddress: string){
    const response = await fetch(`https://mammouth-ts.onrender.com/database/getDatabaseData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse("dev-f34bb00a492a1a506bfsfefeojfqo51dsdzd023cd4e4d9d4dfa140621d35084e15319a")
        },
        body: JSON.stringify({ userPublicKey: userPublicAddress })
    });
    const data = await response.json();
    const decryptedData = decryptResponse(data.response);
    console.log("getGameState data", decryptedData);
    return {
        state: data.state,
        response: decryptedData.response
    }
}

export async function updateGameState(userPublicAddress: string, gameState: GameState){
    const response = await fetch(`https://mammouth-ts.onrender.com/database/updateDatabaseData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse("dev-f34bb00a492a1a506bfsfefeojfqo51dsdzd023cd4e4d9d4dfa140621d35084e15319a")
        },
        body: JSON.stringify({ userPublicKey: userPublicAddress, gameState: gameState })
    });
    const data = await response.json();
    const decryptedData = decryptResponse(data.response);
    return {
        state: data.state,
        response: decryptedData.response
    }
}

export async function interactWithContract(){
    const response = await fetch(`https://mammouth-ts.onrender.com/contract/interactWithContract`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse("dev-f34bb00a492a1a506bfsfefeojfqo51dsdzd023cd4e4d9d4dfa140621d35084e15319a")
        },
        body: JSON.stringify({})
    });
    const data = await response.json();
    const decryptedData = decryptResponse(data.response);
    return {
        state: data.state,
        response: decryptedData.response
    }
}

