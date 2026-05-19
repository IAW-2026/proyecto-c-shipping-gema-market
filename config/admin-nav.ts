import { LayoutDashboard, Users } from "lucide-react";

export const ADMIN_NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, route: "/admin/dashboard" },
    { id: "users", label: "Usuarios", icon: Users, route: "/admin/users" },
] as const;
