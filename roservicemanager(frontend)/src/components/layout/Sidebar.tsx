import { Avatar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { Droplets, LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/navConfig";
import { useAuth } from "@/hooks/AuthContext";

export const SIDEBAR_WIDTH = 260;

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 3 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Droplets color="#fff" size={20} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            AssetFlow
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Service Manager
          </Typography>
        </Box>
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        {NAV_ITEMS.filter(
          (item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
        ).map((item) => {
          const Icon = item.icon;
          const itemSx = {
            borderRadius: 2,
            mb: 0.5,
            py: 1,
            "&.active": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "& .MuiListItemIcon-root": { color: "primary.contrastText" },
              "&:hover": { bgcolor: "primary.dark" },
            },
          } as const;

          if (item.disabled) {
            return (
              <Tooltip title="Coming soon" placement="right" key={item.path}>
                <span>
                  <ListItemButton disabled sx={itemSx}>
                    <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                      <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }}
                    />
                  </ListItemButton>
                </span>
              </Tooltip>
            );
          }

          return (
            <ListItemButton key={item.path} component={NavLink} to={item.path} sx={itemSx}>
              <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar sx={{ bgcolor: "primary.light", width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {(user?.username ?? "?").slice(0, 1).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {user?.username ?? "Unknown user"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
            {user?.role?.toLowerCase() ?? "—"}
          </Typography>
        </Box>
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={handleLogout}>
            <LogOut size={18} />
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
