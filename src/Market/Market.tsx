import { useEffect } from "react";
import { useGaming } from "../context/GamingContext"
import { setUserPrice, sellIce } from "./index";
export default function Market() {
    const { state, dispatch } = useGaming();

    useEffect(() => {
        if (state.items.userLevel > 2 && state.basicInfo.ice > 0) {
            const interval = setInterval(() => {
                const { publicDemand } = state.market;
                const sellChance = Math.random() * 100; // Assuming publicDemand is a percentage
                const n = 1; // Number of ice to attempt to sell

                if (sellChance < publicDemand) {
                    sellIce(dispatch, n);
                }
            }, 1000); // Runs every second

            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [state.market.publicDemand, state.basicInfo.ice, dispatch]);

    return (
        <div className={`market ${state.items.userLevel > 2 ? 'container' : ''}`}>
            {state.items.userLevel > 2 && (
                <>
                    <h2>Market</h2>
                    <p>Market Price: {state.market.marketPrice} $</p>
                    <div className="market-user-price">
                        <p>User Price: </p>
                        <input type="number" value={state.market.userPrice} min={0.01} max={state.market.marketPrice*1.7} step={0.01} onChange={(e) => setUserPrice(dispatch, parseFloat(e.target.value))} />$
                    </div>
                    <p>Public Demand: {state.market.publicDemand.toFixed(3)}%</p>
                    <p>Ice Sell: {state.market.iceSell}</p>
                </>
            )}
            {state.items.userLevel > 5 && state.company.level > 2 && (
                <>
                    <br/>
                    <h2>Investments</h2>
                    <p>SP500: {state.investment.sp500.actualPrice}</p>
                    <p>Bitcoin: {state.investment.bitcoin.actualPrice}</p>
                    <p>Ethereum: {state.investment.ethereum.actualPrice}</p>
                </>
            )}
        </div>
    )
}