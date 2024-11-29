import { useState } from "react";
import { useGaming } from "../../context/GamingContext";

export default function Investment() {
    const { state, dispatch } = useGaming();
    const [inputBtc, setInputBtc] = useState(0);
    const [inputEth, setInputEth] = useState(0);
    const [inputSp500, setInputSp500] = useState(0);
    const [isSellingSp500, setIsSellingSp500] = useState(false);
    return (
        <div className="investment">
            <div className='asset'>
                <div>Bitcoin</div>
                <div>Amount: {state.investment.bitcoin.amount.toFixed(4)}</div>
                <div>Avg Buy Price: {state.investment.bitcoin.avgBuyPrice.toFixed(2)}</div>
                <input type="number" min={0}step={0.0001} value={inputBtc} onChange={(e) => setInputBtc(parseFloat(e.target.value))} />
                <div>
                    <button onClick={() => dispatch({ type: "BUY_BITCOIN", payload: inputBtc })}>Buy</button>
                    <button onClick={() => dispatch({ type: "SELL_BITCOIN", payload: inputBtc })} disabled={state.investment.bitcoin.amount == 0}>Sell</button>
                </div>
            </div>
            <div className='asset'>
                <div>Ethereum</div>
                <div>Amount: {state.investment.ethereum.amount.toFixed(4)}</div>
                <div>Avg Buy Price: {state.investment.ethereum.avgBuyPrice.toFixed(2)}</div>
                <input type="number" min={0} step={0.01}value={inputEth} onChange={(e) => setInputEth(parseFloat(e.target.value))} />
                <div>
                    <button onClick={() => dispatch({ type: "BUY_ETHEREUM", payload: inputEth })}>Buy</button>
                    <button onClick={() => dispatch({ type: "SELL_ETHEREUM", payload: inputEth })} disabled={state.investment.ethereum.amount == 0}>Sell</button>
                </div>
            </div>
            <div className='asset'>
                <div>S&P 500</div>
                <div>Amount: {state.investment.sp500.amount.toFixed(4)}</div>
                <div>Avg Buy Price: {state.investment.sp500.avgBuyPrice.toFixed(2)}</div>
                <input type="number" min={0} step={0.1} value={inputSp500} onChange={(e) => setInputSp500(parseFloat(e.target.value))} />
                <div>
                    <button onClick={() => dispatch({ type: "BUY_SP500", payload: inputSp500 })}>
                        Buy
                    </button>
                    <button onClick={() => {
                        dispatch({ type: "SELL_SP500", payload: inputSp500 });
                        setIsSellingSp500(true);
                    }} disabled={state.investment.sp500.amount == 0}>
                        Sell
                    </button>
                </div>
                {isSellingSp500 && (
                    <div>
                        <p>Young Calf .... You really thought you could make it in TradFi ?</p>
                    </div>
                )}
            </div>
        </div>
    );
}