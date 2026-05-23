import React from "react";

export type IconName =
  | "home"
  | "search"
  | "heart"
  | "cart"
  | "user"
  | "close"
  | "chevronRight"
  | "plus"
  | "minus"
  | "check"
  | "truck"
  | "box"
  | "pin"
  | "trash"
  | "sliders"
  | "arrowRight"
  | "arrowLeft"
  | "creditCard"
  | "cash"
  | "shield"
  | "info"
  | "phone"
  | "logout"
  | "image"
  | "mail"
  | "alert"
  | "alertCircle"
  | "sparkle";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  filled?: boolean;
}

export const Icon = ({
  name,
  size = 20,
  stroke = 1.5,
  className = "",
  filled = false,
}: IconProps) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: `inline-block shrink-0 ${className}`,
  };

  const paths: Record<string, React.ReactNode> = {
    home: (
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    heart: (
      <path d="M12 20s-7-4.5-9-9.5C1.5 6 5 3 8 4.5c1.7.8 3 2 4 3.5 1-1.5 2.3-2.7 4-3.5 3-1.5 6.5 1.5 5 6-2 5-9 9.5-9 9.5z" />
    ),
    cart: (
      <>
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M3 4h2l2.5 11.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.5L21 8H6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    ),
    chevronRight: <path d="m9 6 6 6-6 6" />,
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12 5 5 9-12" />,
    truck: (
      <>
        <path d="M3 7h11v10H3zM14 11h4l3 3v3h-7" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    box: (
      <>
        <path d="M3 7l9-4 9 4-9 4z" />
        <path d="M3 7v10l9 4 9-4V7" />
        <path d="M12 11v10" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="2" fill="white" />
        <circle cx="15" cy="12" r="2" fill="white" />
        <circle cx="7" cy="18" r="2" fill="white" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    arrowLeft: (
      <>
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </>
    ),
    creditCard: (
      <>
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <path d="M2 11h20M6 15h3" />
      </>
    ),
    cash: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="1" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6 9v6M18 9v6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v5h1" />
      </>
    ),
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7 13 13 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 13 13 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" />
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6M12 16h.01" />
      </>
    ),
    alertCircle: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6M12 16h.01" />
      </>
    ),
    sparkle: (
      <path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2zM18 14l1 2.5 2.5 1-2.5 1L18 21l-1-2.5L14.5 17.5 17 16.5z" />
    ),
  };

  if (name === "heart" && filled) {
    return (
      <svg {...props} aria-hidden="true">
        <path
          d="M12 20s-7-4.5-9-9.5C1.5 6 5 3 8 4.5c1.7.8 3 2 4 3.5 1-1.5 2.3-2.7 4-3.5 3-1.5 6.5 1.5 5 6-2 5-9 9.5-9 9.5z"
          fill="currentColor"
          stroke="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg {...props} aria-hidden="true">
      {paths[name] || paths.box}
    </svg>
  );
};
