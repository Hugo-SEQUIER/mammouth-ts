import { GameState } from "../interface";
import { encryptResponse, decryptResponse } from "./encryption";

export async function getCurrentPrice(){
    const response = await fetch(`${process.env.REACT_APP_API_URL}/quote/getCurrentPrice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse(process.env.REACT_APP_API_KEY || '')
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
    const response = await fetch(`${process.env.REACT_APP_API_URL}/database/createGameState`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse(process.env.REACT_APP_API_KEY || '')
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
    const response = await fetch(`${process.env.REACT_APP_API_URL}/database/getDatabaseData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse(process.env.REACT_APP_API_KEY || '')
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
    console.log("updateGameState userPublicAddress", userPublicAddress);
    const response = await fetch(`${process.env.REACT_APP_API_URL}/database/updateDatabaseData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse(process.env.REACT_APP_API_KEY || '')
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
    const response = await fetch(`${process.env.REACT_APP_API_URL}/contract/interactWithContract`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': encryptResponse(process.env.REACT_APP_API_KEY || '')
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

