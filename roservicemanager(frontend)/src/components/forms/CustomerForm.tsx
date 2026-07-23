import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Grid, TextField } from "@mui/material";
import type { CustomerRequest } from "@/types/customer";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(150, "Name is too long"),
  contactNumber: z
    .string()
    .min(1, "Contact number is required")
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid contact number"),
  alternateContactNumber: z
    .string()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid contact number")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().max(500, "Address is too long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes are too long").optional().or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

const EMPTY_VALUES: CustomerFormValues = {
  name: "",
  contactNumber: "",
  alternateContactNumber: "",
  email: "",
  address: "",
  notes: "",
};

interface CustomerFormProps {
  formId: string;
  defaultValues?: Partial<CustomerRequest>;
  onSubmit: (values: CustomerRequest) => void;
}

/**
 * Pure form component - no dialog, no submit button, no API calls. It's
 * given a `formId` so the Dialog that hosts it can put its own Save button
 * in the DialogActions area and still trigger this form via the HTML
 * `form="formId"` attribute on that button.
 */
export function CustomerForm({ formId, defaultValues, onSubmit }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { ...EMPTY_VALUES, ...defaultValues },
  });

  // REACT CONCEPT: syncing external props into a form's internal state.
  // react-hook-form only reads `defaultValues` once, on mount. If this form
  // is reused for a *different* customer (edit dialog opened again with new
  // data) without being unmounted, we need to explicitly call `reset()` to
  // push the new values in.
  useEffect(() => {
    reset({ ...EMPTY_VALUES, ...defaultValues });
  }, [defaultValues, reset]);

  const submitHandler = handleSubmit((values) => {
    const payload: CustomerRequest = {
      name: values.name.trim(),
      contactNumber: values.contactNumber.trim(),
      alternateContactNumber: values.alternateContactNumber?.trim() || undefined,
      email: values.email?.trim() || undefined,
      address: values.address?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
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
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
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
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Alternate Contact Number"
            fullWidth
            error={!!errors.alternateContactNumber}
            helperText={errors.alternateContactNumber?.message}
            {...register("alternateContactNumber")}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Address"
            fullWidth
            multiline
            minRows={2}
            error={!!errors.address}
            helperText={errors.address?.message}
            {...register("address")}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Notes"
            fullWidth
            multiline
            minRows={3}
            error={!!errors.notes}
            helperText={errors.notes?.message}
            {...register("notes")}
          />
        </Grid>
      </Grid>
    </form>
  );
}
