import RegisterForm from "../../components/RegisterForm/registerForm";
import style from "./register.module.css";

export default function Register() {
  return (
    <div className={style.register}>
      <RegisterForm />
    </div>
  );
}
