import { ChangeEvent } from "react";
import { Field, Input, SectionTitle, Card, Icon } from "@/app/components/ui";
import type { Address } from "@/app/lib/types/user";
import { RequiredAddressSchema } from "@/app/lib/schemas/address";

interface CheckoutAddressStepProps {
  addr: Address;
  handleInput: (
    key: keyof Address,
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
}

export function CheckoutAddressStep({
  addr,
  handleInput,
}: CheckoutAddressStepProps) {
  const result = RequiredAddressSchema.safeParse(addr);
  const errors: Partial<Record<keyof Address, string>> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof Address;
      // Solo mostrar errores en campos con contenido (evita ruido en estado inicial)
      if (addr[key] && !errors[key]) {
        errors[key] = issue.message;
      }
    }
  }

  // Filtra caracteres no permitidos antes de propagar el cambio al padre
  const onlyDigits =
    (key: keyof Address) => (e: ChangeEvent<HTMLInputElement>) => {
      e.target.value = e.target.value.replace(/\D/g, "");
      handleInput(key)(e);
    };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <SectionTitle eyebrow="Paso 1">Dirección de entrega</SectionTitle>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <Field label="Calle" error={errors.street} inputId="street">
            <Input
              value={addr.street}
              onChange={handleInput("street")}
              placeholder="Av. Colón"
            />
          </Field>
        </div>
        <Field label="Número" error={errors.number} inputId="number">
          <Input
            value={addr.number}
            onChange={onlyDigits("number")}
            placeholder="1234"
            inputMode="numeric"
          />
        </Field>
        <Field label="Código postal" error={errors.zip} inputId="zip">
          <Input
            value={addr.zip}
            onChange={onlyDigits("zip")}
            placeholder="8000"
            inputMode="numeric"
          />
        </Field>
      </div>

      <Card
        padding={14}
        className="flex gap-2.5 items-center mt-2 text-[13px] text-ink-3"
      >
        <Icon name="info" size={15} className="shrink-0" />
        Al continuar, cotizaremos el envío para cada producto de tu carrito.
      </Card>
    </div>
  );
}
