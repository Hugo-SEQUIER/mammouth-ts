import { useEffect, useState } from "react";
import { useGaming } from "../context/GamingContext"
import { setUserPrice } from "./index";
import { checkTechnologyDone } from "../context/utils";

export default function Market() {
    const { state, dispatch } = useGaming();
    const [bonusPublicDemand, setBonusPublicDemand] = useState(1);
    const [hasPortfolioDiversification, setHasPortfolioDiversification] = useState(false);
    const [isDisabledBuyEnergyBar, setIsDisabledBuyEnergyBar] = useState(false);

    useEffect(() => {
        let second = 1;
        if (checkTechnologyDone('Best Sellers', state)){
            second = 0.5;
        }
        const interval = setInterval(() => {
            const sellChance = Math.random() * 100; // Assuming publicDemand is a percentage

            if (sellChance < state.market.publicDemand) {
                dispatch({type: 'SELL_ICE',});
            }
        }, 1000 * second); // Runs every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, [state.market.publicDemand]);

    useEffect(() => {
        if (checkTechnologyDone('Customer Relations', state)){
            setBonusPublicDemand(1.3)
        }
        if (checkTechnologyDone('Portfolio Diversification', state)){
            setHasPortfolioDiversification(true);
        }
    }, [state.laboratory.researchDone])

    const buyEnergyBar = () => {
        if (state.basicInfo.money >= state.shop.energyBar.price) {
            dispatch({type: 'BUY_ENERGY_BAR',});
            setIsDisabledBuyEnergyBar(true);

            setTimeout(() => {
                setIsDisabledBuyEnergyBar(false);
                dispatch({type: 'STOP_ENERGY_BAR',});
            }, 30000);
        }
    }

    return (
        <div className={`market ${state.items.userLevel > 2 ? 'container' : ''}`}>
            {state.items.userLevel > 2 && (
                <>
                    <h2>MARKET</h2>
                    <p>Market Price: {state.market.marketPrice} $</p>
                    <div className="market-user-price">
                        <p>User Price: </p>
                        <input type="number" value={state.market.userPrice} min={0.01} max={state.market.marketPrice*1.7} step={0.01} onChange={(e) => setUserPrice(dispatch, parseFloat(e.target.value))} />$
                    </div>
                    <p>Public Demand: {(state.market.publicDemand * bonusPublicDemand).toFixed(3) || 0}%</p>
                    <p>Ice Sell: {state.market.iceSell}</p>
                    <br/>
                    <h2>Shop</h2>
                    <p>Energy Bar : {state.shop.energyBar.price.toFixed(2) || 0} $</p>
                    {isDisabledBuyEnergyBar ? <p>You can't buy energy bar yet</p> : <button onClick={() => buyEnergyBar()} disabled={isDisabledBuyEnergyBar}>Buy</button>}
                </>    
            )}
            {state.items.userLevel >= 5 && state.company.level > 2 && (
                <>
                    <br/>
                    <h2>INVESTMENTS</h2>
                    <p>SPY: {state.investment.spy.actualPrice}</p>
                    <p>Bitcoin: {state.investment.bitcoin.actualPrice}</p>
                    <p>Ethereum: {state.investment.ethereum.actualPrice}</p>
                    {hasPortfolioDiversification && (
                        <p>Laika: {state.investment.laika.actualPrice}</p>
                    )}
                </>
            )}
        </div>
    )
}