import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Grid, MenuItem, TextField } from "@mui/material";
import { useTeamMembersQuery } from "@/hooks/useTeamMemberQueries";
import type { CreatePaymentRequest, PaymentMethod } from "@/types/payment";

const paymentSchema = z.object({
  amount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: "Amount is required" }).positive("Must be a positive amount")
  ),
  paymentDate: z.string().min(1, "Payment date is required"),
  method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"]),
  customerAssetId: z.string().optional().or(z.literal("")),
  referenceNote: z.string().max(255, "Note is too long").optional().or(z.literal("")),
  recordedById: z.string().optional().or(z.literal("")),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
];

interface PaymentFormProps {
  formId: string;
  customerId: string;
  /** Optional - lets the payment be tagged to a specific asset for context on the ledger. */
  assetOptions?: Array<{ id: string; name: string }>;
  onSubmit: (values: CreatePaymentRequest) => void;
}

/**
 * Records money actually received. Amount + date + method are the only
 * required fields - tagging it to an asset and naming who collected it are
 * both optional context, not requirements, since the office sometimes just
 * needs to log "customer paid ₹2,000 today" without itemizing it further.
 */
export function PaymentForm({ formId, customerId, assetOptions = [], onSubmit }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    // See AssetForm.tsx for why this cast is needed - zodResolver's type
    // overloads can't always settle on one branch when a schema combines
    // a z.preprocess() numeric field with other optional fields.
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      amount: undefined,
      paymentDate: todayIsoDate(),
      method: "CASH",
      customerAssetId: "",
      referenceNote: "",
      recordedById: "",
    },
  });

  const { data: teamMembers = [] } = useTeamMembersQuery();

  const submitHandler = handleSubmit((values) => {
    const payload: CreatePaymentRequest = {
      customerId,
      amount: values.amount,
      paymentDate: values.paymentDate,
      method: values.method,
      customerAssetId: values.customerAssetId || undefined,
      referenceNote: values.referenceNote?.trim() || undefined,
      recordedById: values.recordedById || undefined,
    };
    onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={submitHandler} noValidate>
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            autoFocus
            error={!!errors.amount}
            helperText={errors.amount?.message}
            {...register("amount")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Payment Date"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.paymentDate}
            helperText={errors.paymentDate?.message}
            {...register("paymentDate")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Method" select fullWidth {...register("method")}>
            {METHOD_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="For Asset (optional)" select fullWidth defaultValue="" {...register("customerAssetId")}>
            <MenuItem value="">
              <em>General / not asset-specific</em>
            </MenuItem>
            {assetOptions.map((asset) => (
              <MenuItem key={asset.id} value={asset.id}>
                {asset.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={12}>
          <TextField label="Recorded By (optional)" select fullWidth defaultValue="" {...register("recordedById")}>
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
            label="Reference / Note (optional)"
            fullWidth
            multiline
            minRows={2}
            placeholder="e.g. UPI ref no., or what this payment was for"
            error={!!errors.referenceNote}
            helperText={errors.referenceNote?.message}
            {...register("referenceNote")}
          />
        </Grid>
      </Grid>
    </form>
  );
}
