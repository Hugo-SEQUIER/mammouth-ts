import { useEffect, useState } from "react";
import { useGaming } from "../context/GamingContext";
import { checkTechnologyDone } from "../context/utils";
import { usePublicKey } from "../context/publicKeyContext";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Stats() {
    const { state, dispatch } = useGaming();
    const [bonusIcePerSecond, setBonusIcePerSecond] = useState(1);
    const [bonusIcePerClick, setBonusIcePerClick] = useState(1);
    const { updatePublicKey } = usePublicKey();
    const { wallet } = useWallet();
    
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch({ type: "AUTO_MINE_ICE" });
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (wallet?.adapter?.publicKey) {
            updatePublicKey(wallet.adapter.publicKey.toString());
        }
    }, [wallet?.adapter?.publicKey]);

    useEffect(() => {
        if (checkTechnologyDone('Ice Defogger', state)){
            setBonusIcePerClick(1.15)
        }
        if (checkTechnologyDone('Advanced Mining Techniques', state)){
            setBonusIcePerSecond(1.2)
        }
    }, [state.laboratory.researchDone])

    return (
        <div className="stats container">
            <h2>Ice Collected: {Math.floor(state.basicInfo.ice)}</h2>
            <div className="stats-info">
                <p>Ice per click: {(state.basicInfo.icePerClick * bonusIcePerClick).toFixed(1)}</p>
                <p>Ice per second: {(state.basicInfo.icePerSecond * bonusIcePerSecond).toFixed(2)}</p>
                <p>Money: {state.basicInfo.money.toFixed(2)} $</p>
                <p>Nb click allowed: {state.basicInfo.nbClickAllowed}</p>
            </div>
        </div>
    )
}