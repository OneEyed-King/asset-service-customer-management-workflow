package com.vc.roservicemanager.teammember.controller;

import com.vc.roservicemanager.teammember.dto.CreateTeamMemberRequest;
import com.vc.roservicemanager.teammember.dto.SeatUsageDto;
import com.vc.roservicemanager.teammember.dto.TeamMemberDto;
import com.vc.roservicemanager.teammember.dto.UpdateTeamMemberRoleRequest;
import com.vc.roservicemanager.teammember.service.TeamMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Team member management. Read access (roster, seat usage) is available to
 * OWNER and ADMIN - both have "full visibility" per the product's role
 * model. Mutations (invite, role change, deactivate/reactivate) are
 * restricted to OWNER, who is the only role that manages billing and team
 * membership.
 */
@RestController
@RequestMapping("/api/team-members")
@RequiredArgsConstructor
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public List<TeamMemberDto> list() {

        return teamMemberService.list();
    }

    @GetMapping("/seats")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public SeatUsageDto seatUsage() {

        return teamMemberService.seatUsage();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('OWNER')")
    public TeamMemberDto create(
            @Valid @RequestBody CreateTeamMemberRequest request) {

        return teamMemberService.create(request);
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('OWNER')")
    public TeamMemberDto updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTeamMemberRoleRequest request) {

        return teamMemberService.updateRole(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('OWNER')")
    public void deactivate(@PathVariable UUID id) {

        teamMemberService.deactivate(id);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('OWNER')")
    public TeamMemberDto activate(@PathVariable UUID id) {

        return teamMemberService.activate(id);
    }

}
