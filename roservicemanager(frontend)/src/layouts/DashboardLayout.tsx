import type { ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

/**
 * REACT CONCEPT: "layout" component.
 * This wraps every authenticated page with the same permanent sidebar and
 * top bar, and renders the page-specific content passed in via `children`
 * in the remaining space. Think of it like a JSP/Thymeleaf layout template
 * with a <content> placeholder, but expressed as a plain React component.
 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <Toolbar sx={{ minHeight: 64 }} />
        <Box sx={{ flexGrow: 1, p: 4 }}>{children}</Box>
      </Box>
    </Box>
  );
}
