import { Link } from "react-router-dom"
import style from "./loginForm.module.css"
import logo from "../../assets/war_logo.png"


export default function LoginForm(){
    return(
        <div className={style.login}>
            <img src={logo} alt="" />
            <div className={style.inputs}>
                <input type="text" placeholder="Email" />
                <input type="text" placeholder="Senha"/>
                <button>Fazer login</button>
            </div>
            <Link to="cadastro">Não possui login? <span>Cadastre-se!</span></Link>
        </div>
    )
}