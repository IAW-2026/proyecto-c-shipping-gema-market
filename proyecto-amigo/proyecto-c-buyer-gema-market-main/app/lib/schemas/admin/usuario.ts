import { z } from "zod";
import { AddressSchema } from "../address";

export const AdminUsuarioUpdateSchema = z.object({
  fullName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre es demasiado largo"),
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

export type AdminUsuarioUpdateInput = z.infer<typeof AdminUsuarioUpdateSchema>;
