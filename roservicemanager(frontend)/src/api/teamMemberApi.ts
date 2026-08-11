import { axiosClient } from "@/api/axiosClient";
import type {
  CreateTeamMemberRequest,
  SeatUsage,
  TeamMember,
  UpdateTeamMemberRoleRequest,
} from "@/types/teamMember";

export const teamMemberApi = {
  list: async (): Promise<TeamMember[]> => {
    const response = await axiosClient.get<TeamMember[]>("/team-members");
    return response.data;
  },

  seatUsage: async (): Promise<SeatUsage> => {
    const response = await axiosClient.get<SeatUsage>("/team-members/seats");
    return response.data;
  },

  create: async (payload: CreateTeamMemberRequest): Promise<TeamMember> => {
    const response = await axiosClient.post<TeamMember>("/team-members", payload);
    return response.data;
  },

  updateRole: async (id: string, payload: UpdateTeamMemberRoleRequest): Promise<TeamMember> => {
    const response = await axiosClient.patch<TeamMember>(`/team-members/${id}/role`, payload);
    return response.data;
  },

  deactivate: async (id: string): Promise<void> => {
    await axiosClient.patch(`/team-members/${id}/deactivate`);
  },

  activate: async (id: string): Promise<TeamMember> => {
    const response = await axiosClient.patch<TeamMember>(`/team-members/${id}/activate`);
    return response.data;
  },
};
