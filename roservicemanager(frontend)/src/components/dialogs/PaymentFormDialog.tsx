import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useCreatePaymentMutation } from "@/hooks/usePaymentQueries";
import type { CreatePaymentRequest } from "@/types/payment";

interface PaymentFormDialogProps {
  open: boolean;
  onClose: () => void;
  customer: { id: string; name: string };
  assetOptions?: Array<{ id: string; name: string }>;
}

const FORM_ID = "payment-form";

export function PaymentFormDialog({ open, onClose, customer, assetOptions }: PaymentFormDialogProps) {
  const createMutation = useCreatePaymentMutation();

  const handleSubmit = (values: CreatePaymentRequest) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Payment recorded");
        onClose();
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Could not record payment."));
      },
    });
  };

  return (
    <Dialog open={open} onClose={createMutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Record Payment — {customer.name}
        <IconButton size="small" onClick={onClose} disabled={createMutation.isPending}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <PaymentForm formId={FORM_ID} customerId={customer.id} assetOptions={assetOptions} onSubmit={handleSubmit} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={createMutation.isPending} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} variant="contained" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
