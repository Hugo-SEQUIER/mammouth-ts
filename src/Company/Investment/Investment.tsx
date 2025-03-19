import { useEffect, useState } from "react";
import { useGaming } from "../../context/GamingContext";
import { checkTechnologyDone } from "../../context/utils";

export default function Investment() {
    const { state, dispatch } = useGaming();
    const [inputBtc, setInputBtc] = useState(0);
    const [inputEth, setInputEth] = useState(0);
    const [inputspy, setInputspy] = useState(0);
    const [inputLaika, setInputLaika] = useState(0);
    const [isSellingspy, setIsSellingspy] = useState(false);
    const [isSellingLaika, setIsSellingLaika] = useState(false);
    const [hasPortfolioDiversification, setHasPortfolioDiversification] = useState(false);

    useEffect(() => {
        if (checkTechnologyDone('Portfolio Diversification', state)){
            setHasPortfolioDiversification(true);
        }
    }, [state.laboratory.researchDone])

    return (
        <div className="investment">
            <div className='asset'>
                <h3>Bitcoin</h3>
                <div>Amount: {state.investment.bitcoin.amount.toFixed(4)}</div>
                <div>Avg Buy Price: {state.investment.bitcoin.avgBuyPrice.toFixed(2)}</div>
                <input type="number" min={0}step={0.0001} value={inputBtc} onChange={(e) => setInputBtc(parseFloat(e.target.value))} />
                <div>
                    <button onClick={() => {
                        if (inputBtc > 0) {
                            dispatch({ type: "BUY_BITCOIN", payload: inputBtc });
                        }
                    }}>Buy</button>
                    <button onClick={() => {
                        if (inputBtc > 0 && state.investment.bitcoin.amount > inputBtc) {
                            dispatch({ type: "SELL_BITCOIN", payload: inputBtc });
                        }
                    }} disabled={state.investment.bitcoin.amount == 0}>Sell</button>
                </div>
            </div>
            <div className='asset'>
                <h3>Ethereum</h3>
                <div>Amount: {state.investment.ethereum.amount.toFixed(4)}</div>
                <div>Avg Buy Price: {state.investment.ethereum.avgBuyPrice.toFixed(2)}</div>
                <input type="number" min={0} step={0.01}value={inputEth} onChange={(e) => setInputEth(parseFloat(e.target.value))} />
                <div>
                    <button onClick={() => {
                        if (inputEth > 0) {
                            dispatch({ type: "BUY_ETHEREUM", payload: inputEth });
                        }
                    }}>Buy</button>
                    <button onClick={() => {
                        if (inputEth > 0 && state.investment.ethereum.amount > inputEth) {
                            dispatch({ type: "SELL_ETHEREUM", payload: inputEth })
                        }
                    }} disabled={state.investment.ethereum.amount == 0}>Sell</button>
                </div>
            </div>
            <div className='asset'>
                <h3>SPY</h3>
                <div>Amount: {state.investment.spy.amount.toFixed(4)}</div>
                <div>Avg Buy Price: {state.investment.spy.avgBuyPrice.toFixed(2)}</div>
                <input type="number" min={0} step={0.1} value={inputspy} onChange={(e) => setInputspy(parseFloat(e.target.value))} />
                <div>
                    <button onClick={() => {
                        if (inputspy > 0) {
                            dispatch({ type: "BUY_spy", payload: inputspy });
                        }
                    }}>
                        Buy
                    </button>
                    <button onClick={() => {
                        if (inputspy > 0 && state.investment.spy.amount > inputspy) {
                            dispatch({ type: "SELL_spy", payload: inputspy });
                            setIsSellingspy(true);
                        }
                    }} disabled={state.investment.spy.amount == 0}>
                        Sell
                    </button>
                </div>
                {isSellingspy && (
                    <div>
                        <p>Young Calf .... You really thought you could make it in TradFi ?</p>
                    </div>
                )}
            </div>
            {hasPortfolioDiversification && (
                <div className='asset'>
                    <h3>Laika</h3>
                    <div>Amount: {state.investment.laika.amount.toFixed(4)}</div>
                    <div>Avg Buy Price: {state.investment.laika.avgBuyPrice.toFixed(2)}</div>
                    <input type="number" min={0} step={0.1} value={inputLaika} onChange={(e) => setInputLaika(parseFloat(e.target.value))} />
                    <div>
                        <button onClick={() => {
                            if (inputLaika > 0) {
                                dispatch({ type: "BUY_LAIKA", payload: inputLaika });
                            }
                        }}>
                            Buy
                        </button>
                        <button onClick={() => {
                            if (inputLaika > 0 && state.investment.laika.amount > inputLaika) {
                                dispatch({ type: "SELL_LAIKA", payload: inputLaika });
                                setIsSellingLaika(true);
                            }
                        }} disabled={state.investment.laika.amount == 0}>
                            Sell
                        </button>
                    </div>
                    {isSellingLaika && (
                        <div>
                            <p>Wouf</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}