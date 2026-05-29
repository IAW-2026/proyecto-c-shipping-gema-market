import { LayoutDashboard, Truck, Package, DollarSign } from "lucide-react";

export const ADMIN_NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, route: "/admin/dashboard" },
    { id: "drivers", label: "Repartidores", icon: Truck, route: "/admin/drivers" },
    { id: "shipments", label: "Pedidos", icon: Package, route: "/admin/shipments" },
    { id: "rates", label: "Tarifas", icon: DollarSign, route: "/admin/rates" },
] as const;
