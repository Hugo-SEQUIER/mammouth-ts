import { useEffect } from "react";
import { useGaming } from "../context/GamingContext";
import { upgradePickaxe, upgradeUserLevel, upgradeGloves } from "./index";

export default function Pickaxe() {
    const { state, dispatch } = useGaming();

    useEffect(() => {
        if (state.items.userLevel == 2) {
            dispatch({ type: "UPGRADE_PICKAXE" });
        }
    }, [state.items.userLevel]);

    return (
        <div className="items container">
            <h2>USER</h2>
            <p>User Level: {state.items.userLevel}</p>
            <p>Cost Upgrade: {Math.floor(state.items.costUpgrade)} ice</p>
            <button
                onClick={() => upgradeUserLevel(dispatch)}
                disabled={state.basicInfo.ice < state.items.costUpgrade}
            >
                Upgrade User Level
            </button>
            <br />
            {state.items.userLevel > 1 && (
                <>
                    <h2>ITEMS</h2>
                    <p>Pickaxe Level: {state.items.pickaxe.level}</p>
                    <p>Cost Upgrade: {Math.floor(state.items.pickaxe.upgradeCost)} $</p>
                    <button 
                        onClick={() => upgradePickaxe(dispatch)}
                        disabled={state.basicInfo.money < state.items.pickaxe.upgradeCost}
                    >
                        Upgrade Pickaxe
                    </button>
                    <br />
                    <p>Gloves Level: {state.items.gloves.level}</p>
                    <p>Cost Upgrade: {Math.floor(state.items.gloves.upgradeCost)} $</p>
                    <button 
                        onClick={() => upgradeGloves(dispatch)}
                        disabled={state.basicInfo.money < state.items.gloves.upgradeCost}
                    >
                        Upgrade Gloves
                    </button>
                </>
            )}
            
        </div>
    )
}