import { Link } from "react-router-dom";
import style from "./loginForm.module.css";
import logo from "../../assets/war_logo.png";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsersService } from "../../service/userService";
import { useAuthStore } from "../../store/useAuthStore";
import { useState } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormType = z.infer<typeof loginSchema>;

const userService = new UsersService();

export default function LoginForm() {
  const { setToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormType) => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await userService.login({
        username: data.username,
        password: data.password,
      });
      
      // Salva o token no Zustand
      setToken(response.token);
      
    } catch (error: any) {
      console.error("Erro durante login:", error);
      
      if (error.response?.status === 401) {
        setErrorMessage("Credenciais inválidas");
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Erro interno do servidor. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.login}>
      <img src={logo} alt="WAR Logo" />
      <form className={style.inputs} onSubmit={handleSubmit(onSubmit)}>
        {errorMessage && (
          <div style={{ 
            color: "red", 
            marginBottom: "10px", 
            textAlign: "center",
            padding: "8px",
            backgroundColor: "#ffe6e6",
            border: "1px solid #ff9999",
            borderRadius: "4px"
          }}>
            {errorMessage}
          </div>
        )}

        <input 
          type="text" 
          placeholder="Username" 
          {...register("username")} 
          disabled={isLoading}
        />
        {errors.username && (
          <span style={{ color: "red", fontSize: "14px" }}>{errors.username.message}</span>
        )}

        <input 
          type="password" 
          placeholder="Senha" 
          {...register("password")} 
          disabled={isLoading}
        />
        {errors.password && (
          <span style={{ color: "red", fontSize: "14px" }}>{errors.password.message}</span>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <Link to="/register">
        Não tem cadastro? <span>Cadastre-se!</span>
      </Link>
    </div>
  );
}