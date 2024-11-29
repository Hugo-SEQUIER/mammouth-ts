import { useGaming } from "../context/GamingContext"

export default function Laboratory() {
    const { state } = useGaming();
    return (
        <div className={`laboratory ${state.items.userLevel > 10 ? 'container' : ''}`}>
            {state.items.userLevel > 10 && (
                <>
                    <h2>Laboratory</h2>
                    <p>Level: {state.laboratory.level}</p>
                    <p>Upgrade Cost: {state.laboratory.upgradeCost}</p>
                    <p>Search Cost: {state.laboratory.searchCost}</p>
                    <p>Research Speed: {state.laboratory.researchSpeed}</p>
                    <p>Research Queue: {state.laboratory.researchQueue.map((technology) => technology.name).join(", ")}</p>
            <p>Research Progress: {state.laboratory.researchProgress}</p>
                    <p>Research Done: {state.laboratory.researchDone.map((technology) => technology.name).join(", ")}</p>
                </>
            )}
        </div>
    )
}