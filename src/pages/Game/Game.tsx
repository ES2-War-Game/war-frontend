import Map from "../../components/Map/Map";
import style from "./Game.module.css"

export default function Game(){
    return(
        <div className={style.page}>
            <div className={style.fundo}></div>
            <Map/>
        </div>
    )
}