import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  PackageSearch,
  Wrench,
  FileBarChart,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Assets", path: "/assets", icon: PackageSearch },
  { label: "Services", path: "/services", icon: Wrench, disabled: true },
  { label: "Reports", path: "/reports", icon: FileBarChart, disabled: true },
  { label: "Settings", path: "/settings", icon: Settings, disabled: true },
];
