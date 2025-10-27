import { useGameStore } from "../../store/useGameStore";
import Africa from "./Africa/Africa";
import Asia from "./Asia/Asia";
import Europe from "./Europe/Europe";
import NorthAmerica from "./NorthAmerica/NorthAmerica";
import Oceania from "./Oceania/Oceania";
import SouthAmerica from "./SouthAmerica/SouthAmerica";

export default function Map(){
    // subscribe to territoriesColors so Map re-renders when websocket updates the store
    const territoriesColors = useGameStore(state => state.territoriesColors);
    void territoriesColors; // keep subscription active; no direct usage needed here
    

    return(
        <div style={{position:"relative",top:"140px",left:"160px",width:"100vw",height:"100vh"}}>
            <NorthAmerica/>
            <SouthAmerica/>
            <Europe/>
            <Africa/>
            <Asia/>
            <Oceania/>
        </div>
    )
}