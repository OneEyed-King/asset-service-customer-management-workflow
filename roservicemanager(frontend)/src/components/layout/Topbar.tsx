import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { NAV_ITEMS } from "@/components/layout/navConfig";
import { SIDEBAR_WIDTH } from "@/components/layout/Sidebar";

function resolvePageTitle(pathname: string): string {
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
  return match?.label ?? "Asset & Service Manager";
}

export function Topbar() {
  const location = useLocation();

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        ml: `${SIDEBAR_WIDTH}px`,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {resolvePageTitle(location.pathname)}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
    </AppBar>
  );
}
