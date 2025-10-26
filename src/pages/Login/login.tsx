import LoginForm from "../../components/LoginForm/loginForm";
import style from "./login.module.css";

export default function Login() {
  return (
    <div className={style.login}>
      {/*<Link className={style.homePill} to="/">
        <span className={style.arrow}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 6L9 12L15 18" stroke="#13551c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className={style.text}>ir para home</span>
      </Link>*/}
      <LoginForm />
    </div>
  );
}
