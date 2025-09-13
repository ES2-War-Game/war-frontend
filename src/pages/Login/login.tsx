import LoginForm from "../../components/LoginForm/loginForm";
import style from "./login.module.css";

export default function Login() {
  return (
    <div className={style.login}>
      <LoginForm />
    </div>
  );
}
