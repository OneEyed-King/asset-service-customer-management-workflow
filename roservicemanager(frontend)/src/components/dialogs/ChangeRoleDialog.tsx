import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";
import { RolePermissionCard } from "@/components/common/RolePermissionCard";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useUpdateTeamMemberRoleMutation } from "@/hooks/useTeamMemberQueries";
import { ASSIGNABLE_ROLES } from "@/constants/rolePermissions";
import type { AssignableRole, TeamMember } from "@/types/teamMember";

interface ChangeRoleDialogProps {
  open: boolean;
  member?: TeamMember;
  onClose: () => void;
}

/**
 * Small, focused dialog for reassigning ADMIN <-> TECHNICIAN, with the
 * same permission cards used in TeamMemberForm so the Owner sees exactly
 * what they're changing before confirming.
 */
export function ChangeRoleDialog({ open, member, onClose }: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AssignableRole>("TECHNICIAN");
  const updateRoleMutation = useUpdateTeamMemberRoleMutation();

  // Pre-select whichever role the member currently has each time the
  // dialog opens (mirrors the reset() pattern in CustomerForm, wired to
  // the dialog's enter transition instead of a useEffect).
  const handleOpen = () => {
    if (member && member.role !== "OWNER") {
      setSelectedRole(member.role);
    }
  };

  const handleSave = () => {
    if (!member) return;
    updateRoleMutation.mutate(
      { id: member.id, payload: { role: selectedRole } },
      {
        onSuccess: () => {
          toast.success(`${member.fullName}'s role updated`);
          onClose();
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "Could not update role."));
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={updateRoleMutation.isPending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ transition: { onEnter: handleOpen } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Change Role
        <IconButton size="small" onClick={onClose} disabled={updateRoleMutation.isPending}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {member && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Changing role for <strong>{member.fullName}</strong>
            </Typography>
            <Stack spacing={1.5}>
              {ASSIGNABLE_ROLES.map((role) => (
                <RolePermissionCard
                  key={role}
                  role={role}
                  selected={selectedRole === role}
                  onSelect={() => setSelectedRole(role)}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={updateRoleMutation.isPending} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={updateRoleMutation.isPending || !member || selectedRole === member?.role}
        >
          {updateRoleMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
