import { z } from "zod";
import { AddressSchema } from "./address";

export const AccountSchema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z.string().email("El email no es válido"),
  phoneNumber: z
    .string()
    .regex(
      /^[+\d\s\-().]*$/,
      "El teléfono solo puede contener números, espacios, +, -, ( y )",
    )
    .max(30, "El teléfono es demasiado largo")
    .default(""),
  address: AddressSchema,
});

export type AccountInput = z.infer<typeof AccountSchema>;
