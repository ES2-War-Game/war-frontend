import { Link, useNavigate } from "react-router-dom";
import style from "./registerForm.module.css";
import logo from "../../assets/war_logo.png";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsersService } from "../../service/userService";
import { AxiosHttpClientAdapter } from "../../adapter/httpAdapter";

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

const userService = new UsersService(new AxiosHttpClientAdapter());


import { useState } from "react";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormType>({
    resolver: zodResolver(registerSchema),
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const onSubmit = async (data: RegisterFormType) => {
    setSubmitError(null);
    setLoading(true);
    try {
      await userService.register({
        username: data.username,
        email: data.email,
        password: data.password,
        
      });
      console.log("cadastro realizado com sucesso!");
      navigate("/login");
    } catch (err: any) {
      setSubmitError(
        err?.response?.status === 409
          ? "E-mail ou usuário já cadastrado."
          : err?.response?.data?.message || err?.message || "Erro ao cadastrar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.register}>
      <img src={logo} alt="WAR Logo" />
      <form className={style.inputs} onSubmit={handleSubmit(onSubmit)}>
        {submitError && (
          <span style={{ color: "red", marginBottom: 8 }}>{submitError}</span>
        )}
        <input type="text" placeholder="Username" {...register("username")} />
        {errors.username && (
          <span style={{ color: "red" }}>{errors.username.message}</span>
        )}

        <input type="text" placeholder="Email" {...register("email")} />
        {errors.email && (
          <span style={{ color: "red" }}>{errors.email.message}</span>
        )}

        <input type="password" placeholder="Senha" {...register("password")} />
        {errors.password && (
          <span style={{ color: "red" }}>{errors.password.message}</span>
        )}

        <input
          type="password"
          placeholder="Confirmar Senha"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <span style={{ color: "red" }}>{errors.confirmPassword.message}</span>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
      <Link to="/login">
        Já possui login? <span>Realize seu login!</span>
      </Link>
    </div>
  );
}
