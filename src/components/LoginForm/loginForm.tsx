
import { Link } from "react-router-dom";
import style from "./loginForm.module.css";
import logo from "../../assets/war_logo.png";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { UsersService } from "../../service/userService";
import { AxiosHttpClientAdapter } from "../../adapter/httpAdapter";
import type { UserLogin } from "../../types/user";

type LoginFormType = {
    username: string;
    password: string;
};

const userService = new UsersService(new AxiosHttpClientAdapter())


export default function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormType>();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: LoginFormType) => {
        setSubmitError(null);
        setLoading(true);
        try {
            const LoginResponse: UserLogin = {
                username:data.username,
                password:data.password
            }
            console.log(LoginResponse)
            const response = await userService.login(LoginResponse);
            // Aqui você pode redirecionar ou salvar token, se necessário
            // Exemplo: window.location.href = "/home";
            console.log("login realizado com sucesso:",response);
        } catch (error: any) {
            if (error?.response?.status === 401) {
                setSubmitError("Usuário ou senha inválidos.");
            } else {
                setSubmitError(error?.response?.data?.message || error?.message || "Erro ao fazer login. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.login}>
            <img src={logo} alt="WAR Logo" />
            <form className={style.inputs} onSubmit={handleSubmit(onSubmit)}>
                {submitError && (
                    <span style={{ color: "red", marginBottom: 8 }}>{submitError}</span>
                )}
                <input type="text" placeholder="Username" {...register("username", { required: "Username é obrigatório" })} />
                {errors.username && <span style={{color: 'red'}}>{errors.username.message}</span>}

                <input type="password" placeholder="Senha" {...register("password", { required: "Senha é obrigatória" })} />
                {errors.password && <span style={{color: 'red'}}>{errors.password.message}</span>}

                <button type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Fazer login"}
                </button>
            </form>
            <Link to="/register">Não possui login? <span>Cadastre-se!</span></Link>
        </div>
    );
}