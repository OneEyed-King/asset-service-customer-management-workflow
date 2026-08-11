import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { CustomerTable } from "@/components/tables/CustomerTable";
import { CustomerFormDialog } from "@/components/dialogs/CustomerFormDialog";
import { AssetFormDialog } from "@/components/dialogs/AssetFormDialog";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { useCustomersQuery, useDeactivateCustomerMutation } from "@/hooks/useCustomerQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/api/axiosClient";
import type { Customer } from "@/types/customer";

export default function CustomersPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [formDialog, setFormDialog] = useState<{ mode: "create" | "edit"; customer?: Customer } | null>(null);
  const [customerToDeactivate, setCustomerToDeactivate] = useState<Customer | null>(null);
  const [assetDialogCustomer, setAssetDialogCustomer] = useState<Customer | null>(null);

  const queryParams = useMemo(
    () => ({ page, size: pageSize, search: debouncedSearch.trim() || undefined }),
    [page, pageSize, debouncedSearch]
  );

  const { data, isLoading, isError } = useCustomersQuery(queryParams);
  const deactivateMutation = useDeactivateCustomerMutation();

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(0);
  };

  const handleDeactivateConfirm = () => {
    if (!customerToDeactivate) return;
    deactivateMutation.mutate(customerToDeactivate.id, {
      onSuccess: () => {
        toast.success(`${customerToDeactivate.name} deactivated`);
        setCustomerToDeactivate(null);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Could not deactivate customer."));
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your customer records and contact details.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setFormDialog({ mode: "create" })}
        >
          Add Customer
        </Button>
      </Box>

      <TextField
        placeholder="Search by name or contact number..."
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        sx={{ mb: 3, width: { xs: "100%", sm: 380 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          },
        }}
      />

      {isError ? (
        <Typography color="error">Failed to load customers. Please try again.</Typography>
      ) : (
        <CustomerTable
          customers={data?.content ?? []}
          totalElements={data?.totalElements ?? 0}
          page={page}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
          onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
          onEdit={(customer) => setFormDialog({ mode: "edit", customer })}
          onDeactivate={(customer) => setCustomerToDeactivate(customer)}
        />
      )}

      {formDialog && (
        <CustomerFormDialog
          open
          mode={formDialog.mode}
          customer={formDialog.customer}
          onClose={() => setFormDialog(null)}
          onCreated={(customer, { addAsset }) => {
            if (addAsset) setAssetDialogCustomer(customer);
          }}
        />
      )}

      {assetDialogCustomer && (
        <AssetFormDialog
          open
          mode="create"
          fixedCustomer={{ id: assetDialogCustomer.id, name: assetDialogCustomer.name }}
          onClose={() => setAssetDialogCustomer(null)}
        />
      )}

      {customerToDeactivate && (
        <ConfirmDialog
          open
          title="Deactivate customer?"
          description={`"${customerToDeactivate.name}" will be marked inactive. You can re-check with the backend team if reactivation is supported.`}
          confirmLabel="Deactivate"
          confirmColor="error"
          loading={deactivateMutation.isPending}
          onConfirm={handleDeactivateConfirm}
          onClose={() => setCustomerToDeactivate(null)}
        />
      )}
    </Box>
  );
}
