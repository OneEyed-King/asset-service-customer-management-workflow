import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamMemberApi } from "@/api/teamMemberApi";
import type { CreateTeamMemberRequest, UpdateTeamMemberRoleRequest } from "@/types/teamMember";

export const teamMemberKeys = {
  all: ["teamMembers"] as const,
  lists: () => [...teamMemberKeys.all, "list"] as const,
  seats: () => [...teamMemberKeys.all, "seats"] as const,
};

export function useTeamMembersQuery() {
  return useQuery({
    queryKey: teamMemberKeys.lists(),
    queryFn: () => teamMemberApi.list(),
  });
}

export function useSeatUsageQuery() {
  return useQuery({
    queryKey: teamMemberKeys.seats(),
    queryFn: () => teamMemberApi.seatUsage(),
  });
}

function invalidateTeamMemberData(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: teamMemberKeys.lists() });
  queryClient.invalidateQueries({ queryKey: teamMemberKeys.seats() });
}

export function useCreateTeamMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeamMemberRequest) => teamMemberApi.create(payload),
    onSuccess: () => invalidateTeamMemberData(queryClient),
  });
}

export function useUpdateTeamMemberRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTeamMemberRoleRequest }) =>
      teamMemberApi.updateRole(id, payload),
    onSuccess: () => invalidateTeamMemberData(queryClient),
  });
}

export function useDeactivateTeamMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamMemberApi.deactivate(id),
    onSuccess: () => invalidateTeamMemberData(queryClient),
  });
}

export function useActivateTeamMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamMemberApi.activate(id),
    onSuccess: () => invalidateTeamMemberData(queryClient),
  });
}
