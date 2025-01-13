import { mineIce } from "./index";
import { useGaming } from "../context/GamingContext";

export default function IceBlock() {
    const { state, dispatch } = useGaming();

    return (
        <div className="ice-block container" onClick={() => mineIce(state, dispatch)}>
            <span><img src={"./images/iceMammoth2.png"} alt="iceMammoth" /></span>
        </div>
    )
}