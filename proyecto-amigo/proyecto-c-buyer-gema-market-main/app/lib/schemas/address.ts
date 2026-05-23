import { z } from "zod";

// Letras (incluye acentos), números, espacios y signos comunes de direcciones (. , ° º ª # - /)
const STREET_PATTERN = /^[\p{L}\p{N}\s.,#°ºª\-/]+$/u;
const DIGITS_PATTERN = /^\d+$/;

// Dirección opcional — campos con max length, vacíos permitidos (usado en perfil/cuenta)
export const AddressSchema = z.object({
  street: z.string().max(200, "Dirección demasiado larga").default(""),
  number: z.string().max(20, "Número demasiado largo").default(""),
  zip: z.string().max(20, "Código postal demasiado largo").default(""),
});

// Dirección requerida — todos los campos obligatorios (usado en checkout)
export const RequiredAddressSchema = z.object({
  street: z
    .string()
    .min(3, "La calle es requerida")
    .max(50, "Dirección demasiado larga")
    .regex(STREET_PATTERN, "La calle solo puede contener letras y números"),
  number: z
    .string()
    .min(1, "El número es requerido")
    .max(20, "Número demasiado largo")
    .regex(DIGITS_PATTERN, "El número solo puede contener dígitos"),
  zip: z
    .string()
    .min(1, "El código postal es requerido")
    .max(20, "Código postal demasiado largo")
    .regex(DIGITS_PATTERN, "El código postal solo puede contener dígitos"),
});

export type AddressInput = z.infer<typeof AddressSchema>;
export type RequiredAddressInput = z.infer<typeof RequiredAddressSchema>;
