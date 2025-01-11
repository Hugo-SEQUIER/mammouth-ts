import { checkInteractionDone } from "../context/utils";
import { GameState } from "../interface";

export function mineIce(
    state: GameState,
    dispatch: React.Dispatch<any>,
) {
    if (state.basicInfo.nbClickAllowed > 0) {
        if (!checkInteractionDone()){
            return;
        }
    }
    dispatch({ type: "MINE_ICE" });
}