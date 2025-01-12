import { useGaming } from "../context/GamingContext"
import { useEffect, useState } from "react"
import Technology from "./Technology/Technology"
import { getAvailableTechnologies } from "./Technology/index"
import { checkTechnologyDone } from "../context/utils";

export default function Laboratory() {
    const { state, dispatch } = useGaming();
    const [bonusResearchSpeed, setBonusResearchSpeed] = useState(1);
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch({ type: "PROGRESS_RESEARCH" });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (checkTechnologyDone('Research Efficiency', state)){
            setBonusResearchSpeed(1.25)
        }
    }, [state.laboratory.researchDone])

    const availableTechnologies = getAvailableTechnologies(state.laboratory.researchDone);

    return (
        <div className={`laboratory ${state.items.userLevel > 14 ? 'container' : ''}`}>
            {state.items.userLevel > 14 && (
                <>
                    <h2>LABORATORY</h2>
                    {state.laboratory.level > 0 && (
                        <>
                            <div className="laboratory-stats">
                                <p>Level: {state.laboratory.level}</p>
                                <p>Upgrade Cost: {state.laboratory.upgradeCost}</p>
                                <button 
                                    onClick={() => dispatch({ type: "UPGRADE_LABORATORY" })} 
                                    disabled={state.basicInfo.money < state.laboratory.upgradeCost}
                                >
                                    Upgrade Laboratory
                                </button>
                                <p>Research Speed: {(state.laboratory.researchSpeed * bonusResearchSpeed).toFixed(2)}/s</p>
                                <p>Queue: {state.laboratory.researchQueue.map((tech) => tech.name).join(", ")}</p>
                            </div>

                            <div className="research-status">
                                <h3>Current Research</h3>
                                <div className="research-progress">
                                    {state.laboratory.researchQueue.length > 0 ? (
                                        <>
                                            {state.laboratory.researchQueue.map((tech) => (
                                                <div key={tech.name}>
                                                    <p>Researching: {tech.name}</p>
                                                    <p>Reasearch Time: {(tech.researchTime).toFixed(3)}s</p>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p>No active research</p>
                                    )}
                                </div>
                            </div>

                            <div className="available-technologies">
                                <h3>Available Technologies</h3>
                                <div className="tech-grid">
                                    {availableTechnologies.map((tech) => {
                                        if (state.laboratory.level >= 1 && 
                                            ["Ice Defogger", "Production Boost"].includes(tech.name)) {
                                            return <Technology key={tech.name} technology={tech} />;
                                        }
                                        if (state.laboratory.level >= 2 && 
                                            ["Market Analysis","Advanced Mining Techniques", "Research Efficiency", "Brand Recognition"].includes(tech.name)) {
                                            return <Technology key={tech.name} technology={tech} />;
                                        }
                                        if (state.laboratory.level >= 3 && 
                                            ["Customer Relations", "Portfolio Diversification", "Multi-tasking"].includes(tech.name)) {
                                            return <Technology key={tech.name} technology={tech} />;
                                        }
                                        if (state.laboratory.level >= 4) {
                                            return <Technology key={tech.name} technology={tech} />;
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>

                            <div className="completed-research">
                                <h3>Completed Research</h3>
                                <div className="tech-list">
                                    {state.laboratory.researchDone.map((tech) => (
                                        <div key={tech.name} className="completed-tech">
                                            {tech.name} (+{tech.effect}% {tech.category})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    {state.laboratory.level === 0 && (
                        <button 
                            onClick={() => dispatch({ type: "UPGRADE_LABORATORY" })} 
                            disabled={state.basicInfo.money < state.laboratory.upgradeCost}
                        >
                            Create Your Laboratory for {state.laboratory.upgradeCost} $ and become the maddest scientist
                        </button>
                    )}  
                </>
            )}
        </div>
    )
}