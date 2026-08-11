package com.vc.roservicemanager.teammember.service;

import com.vc.roservicemanager.teammember.dto.CreateTeamMemberRequest;
import com.vc.roservicemanager.teammember.dto.SeatUsageDto;
import com.vc.roservicemanager.teammember.dto.TeamMemberDto;
import com.vc.roservicemanager.teammember.dto.UpdateTeamMemberRoleRequest;

import java.util.List;
import java.util.UUID;

public interface TeamMemberService {

    List<TeamMemberDto> list();

    TeamMemberDto create(CreateTeamMemberRequest request);

    TeamMemberDto updateRole(UUID id, UpdateTeamMemberRoleRequest request);

    void deactivate(UUID id);

    TeamMemberDto activate(UUID id);

    SeatUsageDto seatUsage();

}
