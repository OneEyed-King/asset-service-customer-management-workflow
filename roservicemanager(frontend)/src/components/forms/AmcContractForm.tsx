import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Grid, TextField } from "@mui/material";
import type { CreateAmcContractRequest } from "@/types/amc";

const optionalPositiveInt = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().int().positive("Must be a positive number").optional()
);

const amcContractSchema = z
  .object({
    planName: z.string().max(150, "Plan name is too long").optional().or(z.literal("")),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    price: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number({ message: "Price is required" }).positive("Must be a positive amount")
    ),
    visitsIncluded: optionalPositiveInt,
  })
  .superRefine((values, ctx) => {
    if (values.startDate && values.endDate && values.endDate <= values.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
  });

export type AmcContractFormValues = z.infer<typeof amcContractSchema>;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function oneYearFromTodayIsoDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

interface AmcContractFormProps {
  formId: string;
  customerAssetId: string;
  onSubmit: (values: CreateAmcContractRequest) => void;
}

/**
 * Records what an AMC term actually costs and covers - separate from the
 * asset's own underAmc checkbox, which only controls whether the asset
 * shows service-interval fields. Creating a contract here doesn't change
 * that checkbox; the two are deliberately independent.
 */
export function AmcContractForm({ formId, customerAssetId, onSubmit }: AmcContractFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AmcContractFormValues>({
    // See AssetForm.tsx for why this cast is needed - zodResolver's type
    // overloads can't always settle on one branch when a schema combines
    // z.preprocess() numeric fields with a top-level .superRefine().
    resolver: zodResolver(amcContractSchema) as Resolver<AmcContractFormValues>,
    defaultValues: {
      planName: "",
      startDate: todayIsoDate(),
      endDate: oneYearFromTodayIsoDate(),
      price: undefined,
      visitsIncluded: undefined,
    },
  });

  const submitHandler = handleSubmit((values) => {
    const payload: CreateAmcContractRequest = {
      customerAssetId,
      planName: values.planName?.trim() || undefined,
      startDate: values.startDate,
      endDate: values.endDate,
      price: values.price,
      visitsIncluded: values.visitsIncluded,
    };
    onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={submitHandler} noValidate>
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        <Grid size={12}>
          <TextField
            label="Plan Name (optional)"
            fullWidth
            placeholder="e.g. Annual AMC 2026"
            error={!!errors.planName}
            helperText={errors.planName?.message}
            {...register("planName")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.startDate}
            helperText={errors.startDate?.message}
            {...register("startDate")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="End Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.endDate}
            helperText={errors.endDate?.message}
            {...register("endDate")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Price"
            type="number"
            fullWidth
            error={!!errors.price}
            helperText={errors.price?.message}
            {...register("price")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Visits Included (optional)"
            type="number"
            fullWidth
            placeholder="Leave blank for unlimited"
            error={!!errors.visitsIncluded}
            helperText={errors.visitsIncluded?.message}
            {...register("visitsIncluded")}
          />
        </Grid>
      </Grid>
    </form>
  );
}
