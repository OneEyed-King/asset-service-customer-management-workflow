import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Grid, Stack, TextField, Typography } from "@mui/material";
import { RolePermissionCard } from "@/components/common/RolePermissionCard";
import { ASSIGNABLE_ROLES } from "@/constants/rolePermissions";
import type { AssignableRole, CreateTeamMemberRequest } from "@/types/teamMember";

const teamMemberSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username is too long")
    .regex(/^\S+$/, "Username can't contain spaces"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  contactNumber: z
    .string()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid contact number")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "TECHNICIAN"]),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

const EMPTY_VALUES: TeamMemberFormValues = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  contactNumber: "",
  role: "TECHNICIAN",
};

interface TeamMemberFormProps {
  formId: string;
  onSubmit: (values: CreateTeamMemberRequest) => void;
}

/**
 * Pure form component - no dialog, no submit button, no API calls (same
 * split as CustomerForm). Only used for *creating* a team member; changing
 * an existing member's role is a separate, smaller dialog since it's just
 * the one field.
 */
export function TeamMemberForm({ formId, onSubmit }: TeamMemberFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedRole = watch("role");

  const submitHandler = handleSubmit((values) => {
    const payload: CreateTeamMemberRequest = {
      username: values.username.trim(),
      password: values.password,
      fullName: values.fullName.trim(),
      email: values.email?.trim() || undefined,
      contactNumber: values.contactNumber?.trim() || undefined,
      role: values.role,
    };
    onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={submitHandler} noValidate>
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        <Grid size={12}>
          <TextField
            label="Full Name"
            fullWidth
            autoFocus
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            {...register("fullName")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Username"
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
            {...register("username")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Password"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message ?? "At least 8 characters"}
            {...register("password")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Contact Number"
            fullWidth
            error={!!errors.contactNumber}
            helperText={errors.contactNumber?.message}
            {...register("contactNumber")}
          />
        </Grid>

        <Grid size={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Role
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            {ASSIGNABLE_ROLES.map((role: AssignableRole) => (
              <Grid key={role} size={{ xs: 12, sm: 6 }} sx={{ flex: 1 }}>
                <RolePermissionCard
                  role={role}
                  selected={selectedRole === role}
                  onSelect={() => setValue("role", role, { shouldValidate: true })}
                />
              </Grid>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
}
