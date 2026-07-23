import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Chip, CircularProgress, Paper, Tab, Tabs, Typography } from "@mui/material";
import { ArrowLeft, Mail, MapPin, Pencil, Phone, PackageSearch, Wrench, Wallet, StickyNote } from "lucide-react";
import { useCustomerQuery } from "@/hooks/useCustomerQueries";
import { CustomerFormDialog } from "@/components/dialogs/CustomerFormDialog";
import { ComingSoon } from "@/components/common/ComingSoon";

const TABS = [
  { label: "Assets", icon: PackageSearch },
  { label: "Service History", icon: Wrench },
  { label: "Payments", icon: Wallet },
  { label: "Notes", icon: StickyNote },
] as const;

export default function CustomerDetailsPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: customer, isLoading, isError } = useCustomerQuery(customerId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !customer) {
    return (
      <Box>
        <Typography color="error">Could not load this customer.</Typography>
        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/customers")} sx={{ mt: 2 }}>
          Back to Customers
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate("/customers")}
        sx={{ mb: 2 }}
        color="inherit"
      >
        Back to Customers
      </Button>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {customer.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Phone size={14} color="#5B6B8C" />
                <Typography variant="body2" color="text.secondary">
                  {customer.contactNumber}
                  {customer.alternateContactNumber ? ` / ${customer.alternateContactNumber}` : ""}
                </Typography>
              </Box>
              {customer.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Mail size={14} color="#5B6B8C" />
                  <Typography variant="body2" color="text.secondary">
                    {customer.email}
                  </Typography>
                </Box>
              )}
              {customer.address && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <MapPin size={14} color="#5B6B8C" />
                  <Typography variant="body2" color="text.secondary">
                    {customer.address}
                  </Typography>
                </Box>
              )}
            </Box>
            {customer.notes && (
              <Chip label={customer.notes} size="small" sx={{ mt: 1.5, bgcolor: "primary.light", color: "primary.contrastText" }} />
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<Pencil size={16} />}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit Customer
          </Button>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={(_event, value) => setActiveTab(value)}
          sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.label} label={tab.label} icon={<tab.icon size={16} />} iconPosition="start" sx={{ minHeight: 56 }} />
          ))}
        </Tabs>
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <ComingSoon
              title="Asset Module Coming Next"
              description="Customer asset tracking for this customer will be built in the next milestone."
              icon={PackageSearch}
            />
          )}
          {activeTab === 1 && (
            <ComingSoon title="Service History Coming Soon" icon={Wrench} />
          )}
          {activeTab === 2 && <ComingSoon title="Payments Coming Soon" icon={Wallet} />}
          {activeTab === 3 && <ComingSoon title="Notes Coming Soon" icon={StickyNote} />}
        </Box>
      </Paper>

      <CustomerFormDialog
        open={editDialogOpen}
        mode="edit"
        customer={customer}
        onClose={() => setEditDialogOpen(false)}
      />
    </Box>
  );
}
