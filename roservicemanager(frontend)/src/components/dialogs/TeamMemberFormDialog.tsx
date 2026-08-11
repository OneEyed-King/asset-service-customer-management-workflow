import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";
import { TeamMemberForm } from "@/components/forms/TeamMemberForm";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useCreateTeamMemberMutation } from "@/hooks/useTeamMemberQueries";
import type { CreateTeamMemberRequest } from "@/types/teamMember";

interface TeamMemberFormDialogProps {
  open: boolean;
  onClose: () => void;
}

const FORM_ID = "team-member-form";

/**
 * Wraps <TeamMemberForm> in a Dialog and owns the create API call, same
 * split as CustomerFormDialog. There's no "edit" mode here - once created,
 * a team member's role changes through ChangeRoleDialog and their
 * active/inactive state through the table's own actions.
 */
export function TeamMemberFormDialog({ open, onClose }: TeamMemberFormDialogProps) {
  const createMutation = useCreateTeamMemberMutation();

  const handleSubmit = (values: CreateTeamMemberRequest) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Team member added");
        onClose();
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Could not add team member."));
      },
    });
  };

  return (
    <Dialog open={open} onClose={createMutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Add Team Member
        <IconButton size="small" onClick={onClose} disabled={createMutation.isPending}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TeamMemberForm formId={FORM_ID} onSubmit={handleSubmit} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={createMutation.isPending} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} variant="contained" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Adding..." : "Add Member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
