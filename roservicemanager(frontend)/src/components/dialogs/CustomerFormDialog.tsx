import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useCreateCustomerMutation, useUpdateCustomerMutation } from "@/hooks/useCustomerQueries";
import type { Customer, CustomerRequest } from "@/types/customer";

interface CustomerFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  customer?: Customer;
  onClose: () => void;
  /**
   * Fired after a successful CREATE (never on edit), with whether the
   * "add an asset now" checkbox was ticked. The caller owns what happens
   * next (typically opening its own AssetFormDialog) - this component
   * deliberately does NOT manage that dialog itself, because the parent
   * unmounts CustomerFormDialog as soon as `onClose` runs (it's rendered
   * conditionally, e.g. `{formDialog && <CustomerFormDialog .../>}`), which
   * would tear down any follow-up dialog state living in here before it
   * ever got to render.
   */
  onCreated?: (customer: Customer, options: { addAsset: boolean }) => void;
}

const FORM_ID = "customer-form";

/**
 * Wraps <CustomerForm> in a Dialog and owns the actual API call (create vs
 * update, chosen by `mode`). Keeping this separate from CustomerForm means
 * CustomerForm stays a "dumb" component that only knows about form fields,
 * not about dialogs or network requests.
 *
 * When creating a new customer, there's an optional "add an asset now"
 * checkbox - most customers exist *because* they bought or need service on
 * something. Ticking it doesn't open anything itself; it just tells the
 * caller (via `onCreated`) to do that, so the follow-up dialog survives
 * this component unmounting.
 */
export function CustomerFormDialog({ open, mode, customer, onClose, onCreated }: CustomerFormDialogProps) {
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const [addAssetAfterCreate, setAddAssetAfterCreate] = useState(false);

  const handleSubmit = (values: CustomerRequest) => {
    if (mode === "edit" && customer) {
      updateMutation.mutate(
        { id: customer.id, payload: values },
        {
          onSuccess: () => {
            toast.success("Customer updated");
            onClose();
          },
          onError: (error) => {
            toast.error(getApiErrorMessage(error, "Could not update customer."));
          },
        }
      );
      return;
    }

    createMutation.mutate(values, {
      onSuccess: (createdCustomer) => {
        toast.success("Customer created");
        onClose();
        onCreated?.(createdCustomer, { addAsset: addAssetAfterCreate });
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Could not create customer."));
      },
    });
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {mode === "edit" ? "Edit Customer" : "Add Customer"}
        <IconButton size="small" onClick={onClose} disabled={isSubmitting}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <CustomerForm
          formId={FORM_ID}
          defaultValues={
            mode === "edit" && customer
              ? {
                  name: customer.name,
                  contactNumber: customer.contactNumber,
                  alternateContactNumber: customer.alternateContactNumber ?? undefined,
                  email: customer.email ?? undefined,
                  address: customer.address ?? undefined,
                  notes: customer.notes ?? undefined,
                }
              : undefined
          }
          onSubmit={handleSubmit}
        />
        {mode === "create" && (
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={addAssetAfterCreate}
                  onChange={(event) => setAddAssetAfterCreate(event.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    This customer purchased something, or needs a service
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Check this to add the asset (RO unit, AC, etc.) right after saving.
                  </Typography>
                </Box>
              }
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : addAssetAfterCreate ? "Save & Add Asset" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
