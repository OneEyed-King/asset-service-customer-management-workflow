import { useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TeamMemberTable } from "@/components/tables/TeamMemberTable";
import { TeamMemberFormDialog } from "@/components/dialogs/TeamMemberFormDialog";
import { ChangeRoleDialog } from "@/components/dialogs/ChangeRoleDialog";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { SeatUsageBar } from "@/components/common/SeatUsageBar";
import {
  useActivateTeamMemberMutation,
  useDeactivateTeamMemberMutation,
  useSeatUsageQuery,
  useTeamMembersQuery,
} from "@/hooks/useTeamMemberQueries";
import { useAuth } from "@/hooks/AuthContext";
import { getApiErrorMessage } from "@/api/axiosClient";
import type { TeamMember } from "@/types/teamMember";

export default function TeamMembersPage() {
  const { user } = useAuth();
  const canManage = user?.role === "OWNER";

  const { data: members, isLoading, isError } = useTeamMembersQuery();
  const { data: seatUsage } = useSeatUsageQuery();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [roleDialogMember, setRoleDialogMember] = useState<TeamMember | undefined>();
  const [memberToDeactivate, setMemberToDeactivate] = useState<TeamMember | null>(null);

  const deactivateMutation = useDeactivateTeamMemberMutation();
  const activateMutation = useActivateTeamMemberMutation();

  const handleDeactivateConfirm = () => {
    if (!memberToDeactivate) return;
    deactivateMutation.mutate(memberToDeactivate.id, {
      onSuccess: () => {
        toast.success(`${memberToDeactivate.fullName} deactivated`);
        setMemberToDeactivate(null);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Could not deactivate team member."));
      },
    });
  };

  const handleActivate = (member: TeamMember) => {
    activateMutation.mutate(member.id, {
      onSuccess: () => {
        toast.success(`${member.fullName} reactivated`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Could not reactivate team member."));
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Team Members
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {canManage
              ? "Add admins and technicians, and manage their roles."
              : "View who's on your team and what they can access."}
          </Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setAddDialogOpen(true)}>
            Add Team Member
          </Button>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {seatUsage && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SeatUsageBar seatUsage={seatUsage} />
          </Grid>
        )}
      </Grid>

      {isError ? (
        <Typography color="error">Failed to load team members. Please try again.</Typography>
      ) : (
        <TeamMemberTable
          members={members ?? []}
          isLoading={isLoading}
          canManage={canManage}
          onChangeRole={setRoleDialogMember}
          onDeactivate={setMemberToDeactivate}
          onActivate={handleActivate}
        />
      )}

      <TeamMemberFormDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />

      <ChangeRoleDialog
        open={!!roleDialogMember}
        member={roleDialogMember}
        onClose={() => setRoleDialogMember(undefined)}
      />

      {memberToDeactivate && (
        <ConfirmDialog
          open
          title="Deactivate team member?"
          description={`"${memberToDeactivate.fullName}" will lose access immediately and free up a seat. You can reactivate them later.`}
          confirmLabel="Deactivate"
          confirmColor="error"
          loading={deactivateMutation.isPending}
          onConfirm={handleDeactivateConfirm}
          onClose={() => setMemberToDeactivate(null)}
        />
      )}
    </Box>
  );
}
