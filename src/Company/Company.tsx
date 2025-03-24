import { useEffect, useState } from "react";
import { useGaming } from "../context/GamingContext";
import EmployeeComponent from "./Employees/Employee";
import Investment from "./Investment/Investment";
import { checkTechnologyDone } from "../context/utils";
import MarketAnalysis from "./Analysis/MarketAnalysis";

export default function Company() {
    const { state, customDispatch } = useGaming();
    const [amountToInject, setAmountToInject] = useState(0);
    const [bankrupt, setBankrupt] = useState(false);
    const [negativeTimeCounter, setNegativeTimeCounter] = useState(0);
    const [hasMarketAnalysis, setHasMarketAnalysis] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            customDispatch({ type: "UPDATE_HAPPINESS" });
            customDispatch({ type: "UPDATE_ICE_PER_SECOND" });
            if (state.company.cashFlow < -3000 && !bankrupt) {
                customDispatch({ type: "BANKRUPT" });
                setBankrupt(true);
            }
            // Track negative cash flow duration
            if (state.company.cashFlow < 0) {
                setNegativeTimeCounter(prev => prev + 1);
                // Trigger bankruptcy after 60 seconds of negative cash flow
                if (negativeTimeCounter >= 60) {
                    customDispatch({ type: "BANKRUPT", payload: "BANKRUPT"});
                    setBankrupt(true);
                    setNegativeTimeCounter(0);
                }
            } else {
                setNegativeTimeCounter(0);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [state.company]);

    useEffect(() => {
        if (state.company.level > 0) {
            setBankrupt(false);
        }
    }, [state.company.level]);

    useEffect(() => {
        if (checkTechnologyDone('Market Analysis', state)){
            setHasMarketAnalysis(true);
        }       
    }, [state.laboratory.researchDone])

    return (
        <>
        <div className={`company ${state.items.userLevel > 4 ? 'container' : ''}`}>
            {state.items.userLevel > 4 && (
                <>
                    <h2>COMPANY</h2>
                    {state.company.level > 0 && (
                        <div className="company-container">
                            <div className="company-stats">
                                <p>Level: {state.company.level}</p>
                                <p>Upgrade Cost: {state.company.upgradeCost.toFixed(2) || 0} $</p>
                                <button onClick={() => customDispatch({ type: "UPGRADE_COMPANY" })} disabled={state.basicInfo.money < state.company.upgradeCost}>
                                    Upgrade Company
                                </button>
                                <p>Cash Flow: {state.company.cashFlow.toFixed(2) || 0}</p>
                                <div className="company-pay-invoices">
                                    <input type="number" value={amountToInject} min={0.01} step={0.01} max={state.basicInfo.money} onChange={(e) => setAmountToInject(parseFloat(e.target.value))} />
                                    <button onClick={() => customDispatch({ type: "INJECT_CASH", payload: amountToInject })}>Inject Cash</button>
                                </div>
                            </div>
                            
                                <div className="company-employees">
                                    <div className="company-employees-container">
                                        {state.company.employees.map((employee, index) => (
                                            <EmployeeComponent employee={employee} key={index} />
                                        ))}
                                    </div>
                                </div>
                            <div className="company-investments-market-analysis">
                                {state.company.level > 2 && (
                                    <div className="company-investment">
                                        <Investment />
                                    </div>
                                )}
                                {hasMarketAnalysis && (
                                    <div className="company-investment-market">
                                        <MarketAnalysis />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {state.company.level == 0 && (
                        <button onClick={() => customDispatch({ type: "UPGRADE_COMPANY" })} disabled={state.basicInfo.money < state.company.upgradeCost}>
                            Create Your Company for only {state.company.upgradeCost} $ that's basically free :D
                        </button>
                    )}
                    
                </>
            )}
            {bankrupt && (
                <div>
                    <h3>BANKRUPT !!!!!!  YOU HAVE TO PAY YOUR INVOICES </h3>
                </div>
            )}
        </div>
        </>
    )
}