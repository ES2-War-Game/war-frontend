import LoginForm from "../../components/LoginForm/loginForm";
import logo from "../../assets/Home_page.png";
import style from "./login.module.css";

export default function Login() {
  return (
    <div
      
      className={style.login}
    >
      <LoginForm />
    </div>
  );
}
