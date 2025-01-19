import { checkInteractionDone } from "../context/utils";
import { GameState } from "../interface";

export async function mineIce(
    state: GameState,
    dispatch: React.Dispatch<any>,
) {
    if (state.basicInfo.nbClickAllowed > 0) {
        if (!await checkInteractionDone()){
            return;
        }
    }
    dispatch({ type: "MINE_ICE" });
}