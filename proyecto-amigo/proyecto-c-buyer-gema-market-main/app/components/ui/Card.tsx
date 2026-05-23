import React from "react";
import { cn } from "@/app/lib/utils/classnames";

interface CardProps {
  children: React.ReactNode;
  padding?: number | string;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

// Recibe estos parametros, permitiendo que el que llame al componente
// pueda personalizarlo a su gusto, y no sea siempre la card de un mismo estilo.
// Es decir, tiene un estilo por defecto, pero en caso de querer cambiarlo, como en
// el caso de estado de la orden que es de color verde, se puede hacer sin problemas.
// Llamando al componente <Card padding={20} className="bg-green-500">
// se logra cambiar el color de fondo, agregando un color de fondo verde.
// Si solo se llama <Card></Card> se mantendran los estilos por defecto.

export const Card = ({
  children,
  padding = 20,
  style = {},
  hover,
  onClick,
  className = "",
}: CardProps) => {
  const interactive = hover || onClick;
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-paper border border-line rounded-r3 max-w-full transition-[box-shadow,transform,border-color] duration-200",
        interactive ? "hover:shadow-sh-2 hover:border-line-2" : "",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      )}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
};
