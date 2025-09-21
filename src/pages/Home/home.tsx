import style from "./home.module.css"
import logo from "../../assets/war_logo.png"
import { Link } from "react-router-dom"


export default function Home(){
    return(
        <div className={style.container}>
            <img src={logo} alt="" />
            <div className={style.buttons}>
                <button><Link to="/jogadores">SinglePlayer</Link></button>
                <button ><Link to="/hub">MultiPLayer</Link></button>
                <button><Link to="/login">Login</Link></button>
            </div>
        </div>

    )
}