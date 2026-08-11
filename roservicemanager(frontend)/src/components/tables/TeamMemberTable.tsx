import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { RotateCcw, ShieldCheck, UserX, Users } from "lucide-react";
import { ROLE_PERMISSIONS } from "@/constants/rolePermissions";
import type { TeamMember } from "@/types/teamMember";

interface TeamMemberTableProps {
  members: TeamMember[];
  isLoading: boolean;
  canManage: boolean;
  onChangeRole: (member: TeamMember) => void;
  onDeactivate: (member: TeamMember) => void;
  onActivate: (member: TeamMember) => void;
}

const ROLE_CHIP_COLOR: Record<TeamMember["role"], "primary" | "secondary" | "default"> = {
  OWNER: "primary",
  ADMIN: "secondary",
  TECHNICIAN: "default",
};

export function TeamMemberTable({
  members,
  isLoading,
  canManage,
  onChangeRole,
  onDeactivate,
  onActivate,
}: TeamMemberTableProps) {
  if (!isLoading && members.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          borderRadius: 4,
        }}
      >
        <Users size={32} color="#5B6B8C" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
          No team members yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add admins or technicians to start delegating work.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "background.default" } }}>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              {canManage && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => {
              const isOwner = member.role === "OWNER";
              return (
                <TableRow key={member.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{member.fullName}</TableCell>
                  <TableCell>{member.username}</TableCell>
                  <TableCell>
                    <Tooltip title={ROLE_PERMISSIONS[member.role].summary}>
                      <Chip
                        size="small"
                        label={ROLE_PERMISSIONS[member.role].label}
                        color={ROLE_CHIP_COLOR[member.role]}
                        icon={isOwner ? <ShieldCheck size={14} /> : undefined}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>{member.email || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={member.enabled ? "Active" : "Inactive"}
                      color={member.enabled ? "success" : "default"}
                    />
                  </TableCell>
                  {canManage && (
                    <TableCell align="right">
                      {isOwner ? (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      ) : (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          <Tooltip title="Change role">
                            <span>
                              <IconButton
                                size="small"
                                disabled={!member.enabled}
                                onClick={() => onChangeRole(member)}
                              >
                                <ShieldCheck size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          {member.enabled ? (
                            <Tooltip title="Deactivate">
                              <IconButton size="small" onClick={() => onDeactivate(member)}>
                                <UserX size={16} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Reactivate">
                              <IconButton size="small" onClick={() => onActivate(member)}>
                                <RotateCcw size={16} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
