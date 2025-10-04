import Africa from "./Africa/Africa";
import Europe from "./Europe/Europe";
import NorthAmerica from "./NorthAmerica/NorthAmerica";
import SouthAmerica from "./SouthAmerica/SouthAmerica";

export default function Map(){
    return(
        <div style={{position:"relative",top:"140px",left:"160px",width:"100vw",height:"100vh"}}>
            <NorthAmerica/>
            <SouthAmerica/>
            <Europe/>
            <Africa/>
        </div>
    )
}