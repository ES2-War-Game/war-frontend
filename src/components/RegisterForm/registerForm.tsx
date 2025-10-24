import { Link } from "react-router-dom";
import style from "./registerForm.module.css";
import logo from "../../assets/war_logo.png";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsersService } from "../../service/userService";
import { useState } from "react";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username deve haver no mínimo 3 caracteres")
      .max(20, "Username não deve passar de 20 caracteres"),
    email: z.string().email("Deve ser um email válido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormType = z.infer<typeof registerSchema>;

const userService = new UsersService();

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormType) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      // Primeiro registra o usuário
      const registerResponse = await userService.register({
        email: data.email,
        password: data.password,
        username: data.username,
      });
      
      console.log('Registro bem-sucedido:', registerResponse);
      
      // Mostra mensagem de sucesso e limpa o formulário
      setSuccessMessage("Cadastro realizado com sucesso!");
      reset();
      
      // Opcional: redirecionar após alguns segundos
      setTimeout(() => {
        setSuccessMessage("");
      }, 8000);
      
    } catch (error: any) {
      console.error("Erro durante registro:", error);
      
      // Mostra mensagem de erro amigável
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.status === 409) {
        setErrorMessage("Usuário ou email já existe");
      } else if (error.response?.status === 400) {
        setErrorMessage("Dados inválidos. Verifique os campos.");
      } else {
        setErrorMessage("Erro interno do servidor. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.register}>
      <img src={logo} alt="WAR Logo" />
      <form className={style.inputs} onSubmit={handleSubmit(onSubmit)}>
        {successMessage && (
          <div style={{ 
            color: "#f0effe", 
            marginBottom: "15px", 
            textAlign: "center",
            padding: "16px 24px",
            backgroundColor: "var(--secondary-400, #1f9b5f)",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            fontFamily: "Inter",
            lineHeight: "24px",
            letterSpacing: "-0.196px",
            boxShadow: "0 4px 8px rgba(31, 155, 95, 0.2)",
            animation: "slideIn 0.3s ease-out",
            width: "calc(100% - 48px)"
          }}>
            {successMessage}
          </div>
        )}

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
          type="email" 
          placeholder="Email" 
          {...register("email")} 
          disabled={isLoading}
        />
        {errors.email && (
          <span style={{ color: "red", fontSize: "14px" }}>{errors.email.message}</span>
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

        <input
          type="password"
          placeholder="Confirmar Senha"
          {...register("confirmPassword")}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <span style={{ color: "red", fontSize: "14px" }}>{errors.confirmPassword.message}</span>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
      <Link to="/login">
        Já possui login? <span>Realize seu login!</span>
      </Link>
      
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}