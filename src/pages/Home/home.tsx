import style from "./home.module.css"
import logo from "../../assets/war_logo.png"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/useAuthStore"

export default function Home(){
    const { clearUser } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearUser();
        navigate("/login");
    };

    return(
        <div className={style.container}>
            <img src={logo} alt="" />
            <div className={style.buttons}>
                <button onClick={()=>navigate("/profile")}><Link to="/profile">Perfil</Link></button>
                <button onClick={()=>navigate("/jogadores")}><Link to="/jogadores">SinglePlayer</Link></button>
                <button onClick={()=>navigate("/hub")}><Link to="/hub">MultiPlayer</Link></button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    )
}