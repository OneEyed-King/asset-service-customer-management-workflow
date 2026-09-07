import { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { Plus, Wallet } from "lucide-react";
import { useCustomerLedgerSummaryQuery, usePaymentsByCustomerQuery } from "@/hooks/usePaymentQueries";

interface CustomerLedgerCardProps {
  customerId: string;
  onRecordPayment: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * The customer's Payments tab: three headline numbers (what they've been
 * charged, what they've paid, what's still owed) plus the full payment
 * history. totalCharges only counts sold-asset prices and AMC contract
 * prices today - a service visit with no AMC behind it has no stored
 * price yet, so it won't show up as a charge (see the roadmap's invoicing
 * phase for closing that gap).
 */
export function CustomerLedgerCard({ customerId, onRecordPayment }: CustomerLedgerCardProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data: summary, isLoading: isSummaryLoading } = useCustomerLedgerSummaryQuery(customerId);
  const { data: paymentsPage, isLoading: isPaymentsLoading } = usePaymentsByCustomerQuery(customerId, {
    page,
    size: pageSize,
  });

  const balanceDue = summary?.balanceDue ?? 0;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Total Charges
            </Typography>
            {isSummaryLoading ? (
              <Skeleton width={100} height={32} />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(summary?.totalCharges ?? 0)}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Total Paid
            </Typography>
            {isSummaryLoading ? (
              <Skeleton width={100} height={32} />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main" }}>
                {formatCurrency(summary?.totalPaid ?? 0)}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Balance Due
            </Typography>
            {isSummaryLoading ? (
              <Skeleton width={100} height={32} />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 700, color: balanceDue > 0 ? "error.main" : "text.primary" }}>
                {formatCurrency(balanceDue)}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={onRecordPayment}>
          Record Payment
        </Button>
      </Box>

      {!isPaymentsLoading && (paymentsPage?.content.length ?? 0) === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          <Wallet size={32} color="#5B6B8C" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
            No payments recorded yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Record a payment to start tracking what this customer has paid.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "background.default" } }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>For</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Recorded By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(paymentsPage?.content ?? []).map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{payment.paymentDate}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{METHOD_LABELS[payment.method] ?? payment.method}</TableCell>
                    <TableCell>{payment.assetName ?? payment.amcPlanName ?? "—"}</TableCell>
                    <TableCell>{payment.referenceNote || "—"}</TableCell>
                    <TableCell>{payment.recordedByName || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={paymentsPage?.totalElements ?? 0}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}
    </Box>
  );
}
