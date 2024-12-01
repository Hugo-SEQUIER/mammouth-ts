import { useGaming } from "../../context/GamingContext";
import { Technology as TechnologyInterface } from "../../interface";

interface TechnologyProps {
    technology: TechnologyInterface;
}

export default function Technology({ technology }: TechnologyProps) {
    const { state, dispatch } = useGaming();

    const handleResearch = () => {
        dispatch({ 
            type: "START_RESEARCH", 
            payload: technology 
        });
    };

    const isResearching = state.laboratory.researchQueue.some(
        tech => tech.name === technology.name
   );
    const isResearched = state.laboratory.researchDone.some(
       tech => tech.name === technology.name
   );

    return (
       <div className="technology">
           <h3>{technology.name}</h3>
           <p>{technology.description}</p>
           <p>Cost: {technology.cost} $</p>
           <p>Effect: +{technology.effect}%</p>
           <button 
               onClick={handleResearch}
               disabled={isResearching || isResearched || state.basicInfo.money < technology.cost}
           >
               {isResearched ? "Researched" : isResearching ? "Researching..." : "Research"}
           </button>
       </div>
   );
}
