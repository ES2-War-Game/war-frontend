import style from "./home.module.css"
import logo from "../../assets/war_logo.png"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/useAuthStore"

export default function Home(){
    const { clearToken } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearToken();
        navigate("/login");
    };

    return(
        <div className={style.container}>
            <img src={logo} alt="" />
            <div className={style.buttons}>
                <button><Link to="/jogadores">SinglePlayer</Link></button>
<<<<<<< HEAD
                <button><Link to="/hub">MultiPlayer</Link></button>
                <button onClick={handleLogout}>Logout</button>
=======
                <button ><Link to="/hub">MultiPLayer</Link></button>
                <button><Link to="/login">Login</Link></button>
>>>>>>> origin/main
            </div>
        </div>
    )
}