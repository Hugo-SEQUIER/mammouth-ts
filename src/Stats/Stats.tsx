import { useEffect } from "react";
import { useGaming } from "../context/GamingContext";

export default function Stats() {
    const { state, dispatch } = useGaming();

    useEffect(() => {
        const interval = setInterval(() => {
            dispatch({ type: "AUTO_MINE_ICE" });
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [state.basicInfo.icePerSecond]);

    return (
        <div className="stats container">
            <h2>Ice Collected: {Math.floor(state.basicInfo.ice)}</h2>
            <div className="stats-info">
                <p>Ice per click: {state.basicInfo.icePerClick.toFixed(1)}</p>
                <p>Ice per second: {state.basicInfo.icePerSecond}</p>
                <p>Money: {state.basicInfo.money.toFixed(2)} $</p>
            </div>
        </div>
    )
}