import { useEffect, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Autocomplete, Box, Checkbox, FormControlLabel, Grid, MenuItem, TextField, Typography } from "@mui/material";
import { useCustomerAutocompleteQuery } from "@/hooks/useCustomerQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { CustomerAssetRequest } from "@/types/asset";
import type { CustomerAutocompleteResult } from "@/types/customer";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Installation date is the most meaningful "clock start" for a service
 * interval (that's when the unit actually went into use); purchase date is
 * the next best signal if there's no installation date yet, and today is
 * the fallback for a brand new record with neither filled in.
 */
function calculateNextServiceDate(
  installationDate: string | undefined,
  purchaseDate: string | undefined,
  intervalDays: number
): string | undefined {
  const baseDateStr = installationDate || purchaseDate || todayIsoDate();
  const base = new Date(baseDateStr);
  if (Number.isNaN(base.getTime()) || !Number.isFinite(intervalDays) || intervalDays <= 0) return undefined;
  base.setDate(base.getDate() + intervalDays);
  return base.toISOString().slice(0, 10);
}

/**
 * Empty-string-safe optional number: an untouched/cleared number input
 * comes through as "" from the DOM. Coerces that (and undefined/null) to
 * undefined instead of letting z.number() reject it or Number("") -> 0
 * silently sneak a wrong value in.
 */
const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().nonnegative("Must be zero or more").optional()
);

const optionalDateString = z.string().optional().or(z.literal(""));

const assetSchema = z
  .object({
    customerId: z.string().min(1, "Select a customer"),
    name: z.string().min(1, "Name is required").max(150, "Name is too long"),
    brand: z.string().max(100, "Brand is too long").optional().or(z.literal("")),
    assetType: z.enum(["RO", "CHIMNEY", "AC", "WATER_SOFTENER", "SPARE_PART", "OTHER"]),
    assetSource: z.enum(["SOLD", "SERVICE_ONLY"]),
    serialNumber: z.string().max(100, "Serial number is too long").optional().or(z.literal("")),
    purchasePrice: optionalNumber,
    amountPaid: optionalNumber,
    paymentStatus: z.enum(["PAID", "PARTIAL", "UNPAID"]),
    purchaseDate: optionalDateString,
    installationDate: optionalDateString,
    warrantyExpiry: optionalDateString,
    // Not every asset needs recurring service tracking - only ones under an
    // AMC / recurring-service arrangement. When false, serviceIntervalDays
    // is optional and irrelevant; when true, it's required (enforced below
    // via .superRefine rather than a plain field-level rule, since it
    // depends on this flag).
    underAmc: z.boolean(),
    serviceIntervalDays: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number().int().positive("Must be a positive number of days").optional()
    ),
    nextServiceDate: optionalDateString,
    installationLocation: z.string().max(150, "Location is too long").optional().or(z.literal("")),
    notes: z.string().max(1000, "Notes are too long").optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.underAmc && !values.serviceIntervalDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceIntervalDays"],
        message: "Service interval is required for assets under a recurring service arrangement",
      });
    }
    if (
      values.purchaseDate &&
      values.installationDate &&
      values.installationDate < values.purchaseDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installationDate"],
        message: "Installation date cannot be earlier than purchase date",
      });
    }
  });

export type AssetFormValues = z.infer<typeof assetSchema>;

const EMPTY_VALUES: AssetFormValues = {
  customerId: "",
  name: "",
  brand: "",
  assetType: "RO",
  assetSource: "SOLD",
  serialNumber: "",
  purchasePrice: undefined,
  amountPaid: undefined,
  paymentStatus: "UNPAID",
  purchaseDate: "",
  installationDate: "",
  warrantyExpiry: "",
  underAmc: true,
  serviceIntervalDays: 180,
  nextServiceDate: "",
  installationLocation: "",
  notes: "",
};

const ASSET_TYPE_OPTIONS: Array<{ value: AssetFormValues["assetType"]; label: string }> = [
  { value: "RO", label: "RO Purifier" },
  { value: "CHIMNEY", label: "Chimney" },
  { value: "AC", label: "AC" },
  { value: "WATER_SOFTENER", label: "Water Softener" },
  { value: "SPARE_PART", label: "Spare Part" },
  { value: "OTHER", label: "Other" },
];

const ASSET_SOURCE_OPTIONS: Array<{ value: AssetFormValues["assetSource"]; label: string }> = [
  { value: "SOLD", label: "Sold by us" },
  { value: "SERVICE_ONLY", label: "Service only (not sold by us)" },
];

const PAYMENT_STATUS_OPTIONS: Array<{ value: AssetFormValues["paymentStatus"]; label: string }> = [
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partially paid" },
  { value: "UNPAID", label: "Unpaid" },
];

interface AssetFormProps {
  formId: string;
  defaultValues?: Partial<CustomerAssetRequest>;
  /**
   * When set, the customer is fixed (e.g. adding an asset from within a
   * customer's own page) and the picker is hidden in favor of a read-only
   * display. When omitted, the form shows a searchable customer picker
   * (e.g. the standalone Assets page, or the "add asset" step right after
   * creating a new customer).
   */
  fixedCustomer?: { id: string; name: string };
  onSubmit: (values: CustomerAssetRequest) => void;
}

/**
 * Pure form component - same split as CustomerForm: no dialog, no submit
 * button, no API calls.
 */
export function AssetForm({ formId, defaultValues, fixedCustomer, onSubmit }: AssetFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssetFormValues>({
    // zodResolver's type declarations overload on zod v3 vs v4 schema
    // shapes; with several z.preprocess()-based numeric fields in this
    // particular schema, TS's overload resolution sometimes can't settle
    // on either branch ("two different types with this name exist").
    // The resolver's actual runtime behavior is correct either way - this
    // cast just tells TS which result type to trust.
    resolver: zodResolver(assetSchema) as Resolver<AssetFormValues>,
    defaultValues: {
      ...EMPTY_VALUES,
      ...defaultValues,
      customerId: fixedCustomer?.id ?? defaultValues?.customerId ?? "",
    },
  });

  // Editing an existing asset starts in "manual" mode so loading the form
  // doesn't immediately overwrite a next-service-date that's already been
  // advanced independently (e.g. by logging a service visit). Creating a
  // new asset starts in "auto" mode, since there's nothing to clobber yet.
  const [editNextServiceDateManually, setEditNextServiceDateManually] = useState(!!defaultValues);

  useEffect(() => {
    reset({
      ...EMPTY_VALUES,
      ...defaultValues,
      customerId: fixedCustomer?.id ?? defaultValues?.customerId ?? "",
    });
    setEditNextServiceDateManually(!!defaultValues);
  }, [defaultValues, fixedCustomer, reset]);

  const [customerSearch, setCustomerSearch] = useState("");
  const debouncedCustomerSearch = useDebouncedValue(customerSearch, 300);
  const { data: customerOptions = [], isFetching: isSearchingCustomers } =
    useCustomerAutocompleteQuery(debouncedCustomerSearch);

  const installationDate = watch("installationDate");
  const purchaseDate = watch("purchaseDate");
  const serviceIntervalDays = watch("serviceIntervalDays");
  const underAmc = watch("underAmc");

  useEffect(() => {
    if (!underAmc || editNextServiceDateManually) return;
    const calculated = calculateNextServiceDate(installationDate, purchaseDate, Number(serviceIntervalDays));
    if (calculated) {
      setValue("nextServiceDate", calculated, { shouldValidate: true });
    }
  }, [underAmc, editNextServiceDateManually, installationDate, purchaseDate, serviceIntervalDays, setValue]);

  const submitHandler = handleSubmit((values) => {
    const payload: CustomerAssetRequest = {
      customerId: values.customerId,
      name: values.name.trim(),
      brand: values.brand?.trim() || undefined,
      assetType: values.assetType,
      assetSource: values.assetSource,
      serialNumber: values.serialNumber?.trim() || undefined,
      purchasePrice: values.purchasePrice,
      amountPaid: values.amountPaid,
      paymentStatus: values.paymentStatus,
      purchaseDate: values.purchaseDate || undefined,
      installationDate: values.installationDate || undefined,
      warrantyExpiry: values.warrantyExpiry || undefined,
      underAmc: values.underAmc,
      serviceIntervalDays: values.underAmc ? values.serviceIntervalDays : undefined,
      nextServiceDate: values.underAmc ? values.nextServiceDate || undefined : undefined,
      installationLocation: values.installationLocation?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };
    onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={submitHandler} noValidate>
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        <Grid size={12}>
          {fixedCustomer ? (
            <TextField label="Customer" fullWidth disabled value={fixedCustomer.name} />
          ) : (
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <Autocomplete<CustomerAutocompleteResult>
                  options={customerOptions}
                  loading={isSearchingCustomers}
                  getOptionLabel={(option) => `${option.name} (${option.contactNumber})`}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onInputChange={(_event, value) => setCustomerSearch(value)}
                  onChange={(_event, value) => field.onChange(value?.id ?? "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer"
                      placeholder="Search by name or contact number..."
                      error={!!errors.customerId}
                      helperText={errors.customerId?.message}
                    />
                  )}
                />
              )}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Asset Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Brand" fullWidth error={!!errors.brand} helperText={errors.brand?.message} {...register("brand")} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Asset Type" select fullWidth {...register("assetType")}>
            {ASSET_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Asset Source" select fullWidth {...register("assetSource")}>
            {ASSET_SOURCE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Serial Number"
            fullWidth
            error={!!errors.serialNumber}
            helperText={errors.serialNumber?.message}
            {...register("serialNumber")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Payment Status" select fullWidth {...register("paymentStatus")}>
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Purchase Price"
            type="number"
            fullWidth
            error={!!errors.purchasePrice}
            helperText={errors.purchasePrice?.message}
            {...register("purchasePrice")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Amount Paid"
            type="number"
            fullWidth
            error={!!errors.amountPaid}
            helperText={errors.amountPaid?.message}
            {...register("amountPaid")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Purchase Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.purchaseDate}
            helperText={errors.purchaseDate?.message}
            {...register("purchaseDate")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Installation Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.installationDate}
            helperText={errors.installationDate?.message}
            {...register("installationDate")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Warranty Expiry"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.warrantyExpiry}
            helperText={errors.warrantyExpiry?.message}
            {...register("warrantyExpiry")}
          />
        </Grid>

        <Grid size={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={underAmc}
                onChange={(event) => setValue("underAmc", event.target.checked, { shouldValidate: true })}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Under AMC / recurring service
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Check this if you need to be reminded when this asset is next due for service. Leave unchecked for
                  a one-off job with no ongoing service commitment.
                </Typography>
              </Box>
            }
          />
        </Grid>

        {underAmc && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Service Interval (days)"
                type="number"
                fullWidth
                error={!!errors.serviceIntervalDays}
                helperText={errors.serviceIntervalDays?.message}
                {...register("serviceIntervalDays")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Next Service Date"
                type="date"
                fullWidth
                disabled={!editNextServiceDateManually}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.nextServiceDate}
                helperText={
                  errors.nextServiceDate?.message ??
                  (editNextServiceDateManually
                    ? "Editing manually"
                    : "Auto-calculated from installation/purchase date + service interval")
                }
                {...register("nextServiceDate")}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editNextServiceDateManually}
                    onChange={(event) => setEditNextServiceDateManually(event.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Edit next service date manually instead of auto-calculating it
                  </Typography>
                }
              />
            </Grid>
          </>
        )}

        <Grid size={12}>
          <TextField
            label="Installation Location"
            fullWidth
            error={!!errors.installationLocation}
            helperText={errors.installationLocation?.message}
            {...register("installationLocation")}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Notes"
            fullWidth
            multiline
            minRows={2}
            error={!!errors.notes}
            helperText={errors.notes?.message}
            {...register("notes")}
          />
        </Grid>
      </Grid>
    </form>
  );
}
