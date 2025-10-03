import NorthAmerica from "./NorthAmerica/NorthAmerica";
import SouthAmerica from "./SouthAmerica/SouthAmerica";

export default function Map(){
    return(
        <div style={{position:"relative",top:"120px",left:"80px",width:"100vw",height:"100vh"}}>
            <NorthAmerica/>
            <SouthAmerica/>
        </div>
    )
}