import { Box, Paper, Stack, Typography } from "@mui/material";
import { Check } from "lucide-react";
import type { UserRole } from "@/types/auth";
import { ROLE_PERMISSIONS } from "@/constants/rolePermissions";

interface RolePermissionCardProps {
  role: UserRole;
  selected?: boolean;
  onSelect?: () => void;
}

/**
 * Shows a role's name, one-line summary, and permission bullets. Used two
 * ways: as a clickable, selectable card in the "assign a role" form
 * (pass `selected`/`onSelect`), or as a plain read-only info card (omit
 * both) wherever a role just needs explaining.
 */
export function RolePermissionCard({ role, selected = false, onSelect }: RolePermissionCardProps) {
  const info = ROLE_PERMISSIONS[role];
  const clickable = !!onSelect;

  return (
    <Paper
      variant="outlined"
      onClick={onSelect}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: clickable ? "pointer" : "default",
        borderColor: selected ? "primary.main" : "divider",
        borderWidth: selected ? 2 : 1,
        bgcolor: selected ? "primary.50" : "background.paper",
        transition: "border-color 0.15s, background-color 0.15s",
        "&:hover": clickable ? { borderColor: "primary.main" } : undefined,
      }}
    >
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {info.label}
        </Typography>
        {selected && (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={13} color="#fff" strokeWidth={3} />
          </Box>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        {info.summary}
      </Typography>
      <Stack component="ul" sx={{ m: 0, pl: 2.25 }}>
        {info.bullets.map((bullet) => (
          <Typography key={bullet} component="li" variant="caption" color="text.secondary">
            {bullet}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}
