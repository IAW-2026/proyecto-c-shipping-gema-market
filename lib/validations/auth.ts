import { z } from "zod";

export const loginSchema = z.object({
    identifier: z.string().min(4, "El ID de operador o usuario es requerido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const signUpSchema = z.object({
    name: z.string().min(2, "El nombre completo es requerido"),
    email: z.string().email("Debe ser un correo válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const verifyCodeSchema = z.object({
    code: z.string().length(6, "El código debe tener 6 dígitos"),
});

export const resetPasswordInitSchema = z.object({
    email: z.string().email("Debe ser un correo válido"),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;
export type ResetPasswordInitFormData = z.infer<typeof resetPasswordInitSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;