// config/operator-nav.ts
import { LayoutDashboard, PackageSearch, History, Wallet, Truck } from "lucide-react";

export const OPERATOR_NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, route: "/dashboard" },
    { id: "available", label: "Por tomar", icon: PackageSearch, route: "/available" },
    { id: "history", label: "Historial", icon: History, route: "/history" },
    { id: "settlements", label: "Liquidaciones", icon: Wallet, route: "/settlements" },
    { id: "courier", label: "Modo repartidor", icon: Truck, route: "/courier" },
] as const;