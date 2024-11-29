import { mineIce } from "./index";
import { useGaming } from "../context/GamingContext";

export default function IceBlock() {
    const { dispatch } = useGaming();

    return (
        <div className="ice-block container" onClick={() => mineIce(dispatch)}>
            <span>🧊</span>
            <p>Mine!</p>
        </div>
    )
}