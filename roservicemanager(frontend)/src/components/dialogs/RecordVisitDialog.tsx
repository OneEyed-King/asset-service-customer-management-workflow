import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAutocompleteQuery, useCreateCustomerMutation } from "@/hooks/useCustomerQueries";
import { useAssetsByCustomerQuery, useCreateAssetMutation } from "@/hooks/useAssetQueries";
import { useCreateServiceHistoryMutation } from "@/hooks/useServiceHistoryQueries";
import { useCreatePaymentMutation } from "@/hooks/usePaymentQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/api/axiosClient";
import type { CustomerAutocompleteResult } from "@/types/customer";
import type { AssetType, CustomerAsset } from "@/types/asset";
import type { PaymentMethod } from "@/types/payment";

interface RecordVisitDialogProps {
  open: boolean;
  onClose: () => void;
}

const ASSET_TYPE_OPTIONS: Array<{ value: AssetType; label: string }> = [
  { value: "RO", label: "RO Purifier" },
  { value: "CHIMNEY", label: "Chimney" },
  { value: "AC", label: "AC" },
  { value: "FRIDGE", label: "Fridge" },
  { value: "WATER_SOFTENER", label: "Water Softener" },
  { value: "SPARE_PART", label: "Spare Part" },
  { value: "OTHER", label: "Other" },
];

const METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
];

const PHONE_PATTERN = /^[0-9+\-\s]{10,15}$/;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The fast path for "someone called about a complaint / needs an
 * off-schedule visit" - one popup, minimal clicks. Both the customer and
 * appliance fields are free-typing autocompletes: pick an existing match
 * if one shows up, or just keep typing a name that doesn't match anything
 * and that becomes the new customer/appliance to create - no separate
 * "+ Add new" button to find and click. A brand new customer only needs a
 * phone number on top of the name (the one thing the database actually
 * requires); everything else can be filled in later from their normal
 * profile.
 */
export function RecordVisitDialog({ open, onClose }: RecordVisitDialogProps) {
  const [customerQuery, setCustomerQuery] = useState("");
  const debouncedCustomerSearch = useDebouncedValue(customerQuery, 300);
  const { data: customerOptions = [], isFetching: isSearchingCustomers } =
    useCustomerAutocompleteQuery(debouncedCustomerSearch);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAutocompleteResult | null>(null);
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const isNewCustomer = !selectedCustomer && customerQuery.trim().length > 0;
  const newCustomerName = customerQuery.trim();
  const isPhoneValid = PHONE_PATTERN.test(newCustomerPhone.trim());

  const { data: assetsPage } = useAssetsByCustomerQuery(selectedCustomer?.id, { page: 0, size: 100 });
  const existingAssets = assetsPage?.content ?? [];

  const [assetQuery, setAssetQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<CustomerAsset | null>(null);
  const [newAssetType, setNewAssetType] = useState<AssetType>("RO");

  const isNewAsset = !selectedAsset && assetQuery.trim().length > 0;
  const newAssetName = assetQuery.trim();

  const [amountCharged, setAmountCharged] = useState("");
  const [remarks, setRemarks] = useState("");
  const [visitDate, setVisitDate] = useState(todayIsoDate());
  const [paidNow, setPaidNow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const createCustomerMutation = useCreateCustomerMutation();
  const createAssetMutation = useCreateAssetMutation();
  const createServiceHistoryMutation = useCreateServiceHistoryMutation();
  const createPaymentMutation = useCreatePaymentMutation();

  const isSubmitting =
    createCustomerMutation.isPending ||
    createAssetMutation.isPending ||
    createServiceHistoryMutation.isPending ||
    createPaymentMutation.isPending;

  const amountValue = Number(amountCharged);
  const isAmountValid = amountCharged.trim() !== "" && Number.isFinite(amountValue) && amountValue > 0;

  const hasCustomer = !!selectedCustomer || (isNewCustomer && isPhoneValid);
  const hasAsset = !!selectedAsset || isNewAsset;

  const canSubmit = hasCustomer && hasAsset && isAmountValid && !!visitDate;

  const resetForm = () => {
    setCustomerQuery("");
    setSelectedCustomer(null);
    setNewCustomerPhone("");
    setAssetQuery("");
    setSelectedAsset(null);
    setNewAssetType("RO");
    setAmountCharged("");
    setRemarks("");
    setVisitDate(todayIsoDate());
    setPaidNow(true);
    setPaymentMethod("CASH");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      let customerId = selectedCustomer?.id;

      if (!customerId) {
        const createdCustomer = await createCustomerMutation.mutateAsync({
          name: newCustomerName,
          contactNumber: newCustomerPhone.trim(),
        });
        customerId = createdCustomer.id;
      }

      let assetId = selectedAsset?.id;

      if (!assetId) {
        const createdAsset = await createAssetMutation.mutateAsync({
          customerId,
          name: newAssetName,
          assetType: newAssetType,
          assetSource: "SERVICE_ONLY",
          paymentStatus: "UNPAID",
          underAmc: false,
        });
        assetId = createdAsset.id;
      }

      await createServiceHistoryMutation.mutateAsync({
        customerAssetId: assetId,
        serviceDate: visitDate,
        completed: true,
        remarks: remarks.trim() || undefined,
        amountCharged: amountValue,
      });

      if (paidNow) {
        await createPaymentMutation.mutateAsync({
          customerId,
          customerAssetId: assetId,
          amount: amountValue,
          paymentDate: visitDate,
          method: paymentMethod,
          referenceNote: "Collected during off-schedule/complaint visit",
        });
      }

      toast.success("Visit recorded");
      resetForm();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not record the visit."));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Record Service / Complaint Visit
        <IconButton size="small" onClick={handleClose} disabled={isSubmitting}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid size={12}>
            <Autocomplete<CustomerAutocompleteResult, false, false, true>
              freeSolo
              options={customerOptions}
              loading={isSearchingCustomers}
              inputValue={customerQuery}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : `${option.name} (${option.contactNumber})`
              }
              onInputChange={(_event, value, reason) => {
                setCustomerQuery(value);
                // "reset" fires when MUI syncs the input text to match a
                // just-picked option (or clears it) - only actual typing
                // ("input") should drop the current selection, otherwise
                // picking an option immediately un-picks itself.
                if (reason === "input") {
                  setSelectedCustomer(null);
                }
              }}
              onChange={(_event, value) => {
                if (value && typeof value !== "string") {
                  setSelectedCustomer(value);
                  setCustomerQuery(value.name);
                } else {
                  setSelectedCustomer(null);
                }
                setAssetQuery("");
                setSelectedAsset(null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer"
                  placeholder="Search, or type a new customer's name..."
                  autoFocus
                />
              )}
            />
          </Grid>

          {isNewCustomer && (
            <Grid size={12}>
              <TextField
                label="Phone Number"
                fullWidth
                placeholder="New customer - phone number needed to save"
                value={newCustomerPhone}
                onChange={(event) => setNewCustomerPhone(event.target.value)}
                error={newCustomerPhone.trim() !== "" && !isPhoneValid}
                helperText={
                  newCustomerPhone.trim() !== "" && !isPhoneValid ? "Enter a valid contact number" : undefined
                }
              />
            </Grid>
          )}

          {hasCustomer && (
            <Grid size={12}>
              <Autocomplete<CustomerAsset, false, false, true>
                freeSolo
                options={existingAssets}
                inputValue={assetQuery}
                getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
                onInputChange={(_event, value, reason) => {
                  setAssetQuery(value);
                  if (reason === "input") {
                    setSelectedAsset(null);
                  }
                }}
                onChange={(_event, value) => {
                  if (value && typeof value !== "string") {
                    setSelectedAsset(value);
                    setAssetQuery(value.name);
                  } else {
                    setSelectedAsset(null);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Appliance"
                    placeholder="Search their appliances, or type one that's new..."
                  />
                )}
              />
            </Grid>
          )}

          {isNewAsset && (
            <Grid size={12}>
              <TextField
                label="Appliance Type"
                select
                fullWidth
                value={newAssetType}
                onChange={(event) => setNewAssetType(event.target.value as AssetType)}
                helperText="Not on record yet - pick the closest type (or Other)"
              >
                {ASSET_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Visit Date"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={visitDate}
              onChange={(event) => setVisitDate(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Amount Charged"
              type="number"
              fullWidth
              value={amountCharged}
              onChange={(event) => setAmountCharged(event.target.value)}
              error={amountCharged.trim() !== "" && !isAmountValid}
              helperText={amountCharged.trim() !== "" && !isAmountValid ? "Must be a positive amount" : undefined}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="Notes (optional)"
              fullWidth
              multiline
              minRows={2}
              placeholder="What was the complaint, what was done..."
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
            />
          </Grid>

          <Grid size={12}>
            <FormControlLabel
              control={<Checkbox checked={paidNow} onChange={(event) => setPaidNow(event.target.checked)} />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Paid now
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Records a matching payment right away. Uncheck if this is being billed for later.
                  </Typography>
                </Box>
              }
            />
          </Grid>
          {paidNow && (
            <Grid size={12}>
              <TextField
                label="Payment Method"
                select
                fullWidth
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              >
                {METHOD_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "Saving..." : "Save Visit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
