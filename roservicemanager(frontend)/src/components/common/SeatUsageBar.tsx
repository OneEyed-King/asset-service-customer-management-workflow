import { Box, LinearProgress, Paper, Typography } from "@mui/material";
import type { SeatUsage } from "@/types/teamMember";

interface SeatUsageBarProps {
  seatUsage: SeatUsage;
}

const PLAN_LABELS: Record<SeatUsage["planTier"], string> = {
  SMALL: "Small",
  GROWING: "Growing",
  MULTI_BRANCH: "Multi-branch",
  ENTERPRISE: "Enterprise",
};

/**
 * "3 of 5 seats used" indicator. The owner counts as one of the seats -
 * seat usage counts every enabled team member, owner included, since a
 * deactivated account frees its seat for someone else.
 */
export function SeatUsageBar({ seatUsage }: SeatUsageBarProps) {
  const { used, limit, planTier } = seatUsage;
  const isUnlimited = limit === null;
  const percentUsed = isUnlimited ? 0 : Math.min(100, (used / Math.max(limit, 1)) * 100);
  const isNearLimit = !isUnlimited && used >= limit;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Seats
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {PLAN_LABELS[planTier]} plan
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: isUnlimited ? 0 : 1 }}>
        {used} {isUnlimited ? "seats used" : `/ ${limit} seats used`}
      </Typography>
      {!isUnlimited && (
        <LinearProgress
          variant="determinate"
          value={percentUsed}
          color={isNearLimit ? "error" : "primary"}
          sx={{ height: 8, borderRadius: 4 }}
        />
      )}
      {isNearLimit && (
        <Typography variant="caption" color="error.main" sx={{ display: "block", mt: 1 }}>
          You're at your seat limit. Deactivate a team member or upgrade your plan to add more.
        </Typography>
      )}
    </Paper>
  );
}
