import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
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
}

const FORM_ID = "customer-form";

/**
 * Wraps <CustomerForm> in a Dialog and owns the actual API call (create vs
 * update, chosen by `mode`). Keeping this separate from CustomerForm means
 * CustomerForm stays a "dumb" component that only knows about form fields,
 * not about dialogs or network requests.
 */
export function CustomerFormDialog({ open, mode, customer, onClose }: CustomerFormDialogProps) {
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
      onSuccess: () => {
        toast.success("Customer created");
        onClose();
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
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
