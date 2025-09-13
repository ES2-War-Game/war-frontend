import { Link } from "react-router-dom";
import style from "./loginForm.module.css";
import logo from "../../assets/war_logo.png";
import { useForm } from "react-hook-form";
import { UsersService } from "../../service/userService";
import { AxiosHttpClientAdapter } from "../../adapter/httpAdapter";

type LoginFormType = {
    username: string;
    password: string;
};

const userService = new UsersService(new AxiosHttpClientAdapter())

export default function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormType>();

    const onSubmit = async (data: LoginFormType) => {        
        try {
            const response = await userService.login({ username: data.username, password: data.password });
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={style.login}>
            <img src={logo} alt="WAR Logo" />
            <form className={style.inputs} onSubmit={handleSubmit(onSubmit)}>
                <input type="text" placeholder="Username" {...register("username", { required: "Username é obrigatório" })} />
                {errors.username && <span style={{color: 'red'}}>{errors.username.message}</span>}

                <input type="password" placeholder="Senha" {...register("password", { required: "Senha é obrigatória" })} />
                {errors.password && <span style={{color: 'red'}}>{errors.password.message}</span>}

                <button type="submit">Fazer login</button>
            </form>
            <Link to="/register">Não possui login? <span>Cadastre-se!</span></Link>
        </div>
    );
}