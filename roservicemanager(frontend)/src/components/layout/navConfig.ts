import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  PackageSearch,
  Wrench,
  FileBarChart,
  Settings,
  UserCog,
} from "lucide-react";
import type { UserRole } from "@/types/auth";

export interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  disabled?: boolean;
  /** If set, only these roles see this nav item. Omit to show it to everyone. */
  allowedRoles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Assets", path: "/assets", icon: PackageSearch },
  { label: "Services", path: "/services", icon: Wrench },
  {
    label: "Team",
    path: "/team-members",
    icon: UserCog,
    allowedRoles: ["OWNER", "ADMIN"],
  },
  { label: "Reports", path: "/reports", icon: FileBarChart, disabled: true },
  { label: "Settings", path: "/settings", icon: Settings, disabled: true },
];
