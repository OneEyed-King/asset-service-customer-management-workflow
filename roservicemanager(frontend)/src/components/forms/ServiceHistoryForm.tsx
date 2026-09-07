import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Grid, MenuItem, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTeamMembersQuery } from "@/hooks/useTeamMemberQueries";
import type { ServiceableAsset } from "@/types/asset";
import type { ServiceHistoryRequest } from "@/types/serviceHistory";

const serviceHistorySchema = z
  .object({
    serviceDate: z.string().min(1, "Service date is required"),
    completed: z.boolean(),
    remarks: z.string().max(1000, "Remarks are too long").optional().or(z.literal("")),
    nextServiceDate: z.string().optional().or(z.literal("")),
    servicedById: z.string().optional().or(z.literal("")),
    // Most routine AMC visits aren't charged separately (covered by the
    // contract), so this stays optional/blank in the common case - only
    // filled in when this particular visit is being billed directly.
    amountCharged: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number().positive("Must be a positive amount").optional()
    ),
  })
  .superRefine((values, ctx) => {
    // A "not completed" visit is worth nothing on its own without saying
    // why - that's what someone will want to see later ("why is this still
    // overdue?").
    if (!values.completed && !values.remarks?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["remarks"],
        message: "Add a note on why the service wasn't completed",
      });
    }
  });

export type ServiceHistoryFormValues = z.infer<typeof serviceHistorySchema>;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function suggestedNextServiceDate(serviceDate: string, intervalDays: number): string {
  const base = serviceDate ? new Date(serviceDate) : new Date();
  base.setDate(base.getDate() + intervalDays);
  return base.toISOString().slice(0, 10);
}

interface ServiceHistoryFormProps {
  formId: string;
  asset: ServiceableAsset;
  onSubmit: (values: ServiceHistoryRequest) => void;
}

/**
 * Pure form component, same split as CustomerForm/AssetForm. Always tied
 * to one specific asset (passed in, not picked here) so it can show a
 * live-computed suggestion for the next service date based on that
 * asset's own service interval.
 *
 * Doubles as the "mark a due service" action - Completed advances the
 * asset's due date (auto-calculated from its interval, same as before);
 * Not Completed just records the attempt with a reason and leaves the
 * asset's existing due date alone unless you explicitly reschedule it.
 */
export function ServiceHistoryForm({ formId, asset, onSubmit }: ServiceHistoryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServiceHistoryFormValues>({
    // See AssetForm.tsx for why this cast is needed - zodResolver's type
    // overloads can't always settle on one branch when a schema combines
    // z.preprocess() numeric fields with other optional fields.
    resolver: zodResolver(serviceHistorySchema) as Resolver<ServiceHistoryFormValues>,
    defaultValues: {
      serviceDate: todayIsoDate(),
      completed: true,
      remarks: "",
      nextServiceDate: "",
      servicedById: "",
      amountCharged: undefined,
    },
  });

  const { data: teamMembers = [] } = useTeamMembersQuery();
  const serviceDate = watch("serviceDate");
  const completed = watch("completed");

  // Only assets under AMC/recurring service have an interval to project a
  // suggestion from - a one-off job has nothing to suggest, so the field
  // just stays blank unless the user types a date themselves. Not-completed
  // visits never get a suggestion either - there's nothing to project a
  // "next due" date from when the job didn't actually happen.
  const suggestion =
    completed && asset.underAmc && asset.serviceIntervalDays
      ? suggestedNextServiceDate(serviceDate || todayIsoDate(), asset.serviceIntervalDays)
      : undefined;

  const submitHandler = handleSubmit((values) => {
    const payload: ServiceHistoryRequest = {
      customerAssetId: asset.id,
      serviceDate: values.serviceDate,
      completed: values.completed,
      remarks: values.remarks?.trim() || undefined,
      nextServiceDate: values.nextServiceDate || undefined,
      servicedById: values.servicedById || undefined,
      amountCharged: values.amountCharged,
    };
    onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={submitHandler} noValidate>
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        <Grid size={12}>
          <Controller
            name="completed"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={field.value}
                onChange={(_event, value) => {
                  if (value !== null) field.onChange(value);
                }}
              >
                <ToggleButton value={true} color="success">
                  <CheckCircle2 size={16} style={{ marginRight: 6 }} />
                  Completed
                </ToggleButton>
                <ToggleButton value={false} color="error">
                  <XCircle size={16} style={{ marginRight: 6 }} />
                  Not Completed
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Service Date"
            type="date"
            fullWidth
            autoFocus
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.serviceDate}
            helperText={errors.serviceDate?.message}
            {...register("serviceDate")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={completed ? "Next Service Date" : "Reschedule To (optional)"}
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            placeholder={suggestion}
            helperText={
              errors.nextServiceDate?.message ??
              (completed
                ? suggestion
                  ? `Leave blank to default to ${suggestion} (this asset's ${asset.serviceIntervalDays}-day interval)`
                  : "This asset isn't under AMC, so leaving this blank means no next service date will be set"
                : "Leave blank to keep the current due date as still due; set a date to reschedule it")
            }
            error={!!errors.nextServiceDate}
            {...register("nextServiceDate")}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Amount Charged (optional)"
            type="number"
            fullWidth
            placeholder="Leave blank if covered by AMC / not billed separately"
            error={!!errors.amountCharged}
            helperText={errors.amountCharged?.message}
            {...register("amountCharged")}
          />
        </Grid>
        <Grid size={12}>
          <TextField label="Serviced By" select fullWidth defaultValue="" {...register("servicedById")}>
            <MenuItem value="">
              <em>Not specified</em>
            </MenuItem>
            {teamMembers
              .filter((member) => member.enabled)
              .map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.fullName} ({member.role})
                </MenuItem>
              ))}
          </TextField>
        </Grid>
        <Grid size={12}>
          <TextField
            label={completed ? "Remarks" : "Reason it wasn't completed"}
            fullWidth
            multiline
            minRows={3}
            placeholder={
              completed
                ? "e.g. Changed the RO candle/filter, cleaned the tank..."
                : "e.g. Customer wasn't home, part unavailable..."
            }
            error={!!errors.remarks}
            helperText={errors.remarks?.message}
            {...register("remarks")}
          />
        </Grid>
        {!completed && (
          <Grid size={12}>
            <Typography variant="caption" color="text.secondary">
              This asset will stay in the due/overdue list unless you set a reschedule date above.
            </Typography>
          </Grid>
        )}
      </Grid>
    </form>
  );
}
