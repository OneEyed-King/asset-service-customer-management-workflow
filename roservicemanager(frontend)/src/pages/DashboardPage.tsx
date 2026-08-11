import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Chip, Grid, Paper, Skeleton, Typography } from "@mui/material";
import { AlertTriangle, CalendarClock, PackageSearch, ShieldCheck, Users } from "lucide-react";
import { useDashboardSummaryQuery } from "@/hooks/useDashboardQueries";
import { DueServiceList, DueServiceListCard, type DueServiceItem } from "@/components/common/DueServiceList";
import { ServiceHistoryFormDialog } from "@/components/dialogs/ServiceHistoryFormDialog";
import type { ServiceableAsset } from "@/types/asset";

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof Users;
  color?: string;
  isLoading: boolean;
}

function StatCard({ label, value, icon: Icon, color = "#4C6FFF", isLoading }: StatCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${color}1A`,
            color,
          }}
        >
          <Icon size={18} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
      {isLoading ? (
        <Skeleton variant="text" width={60} height={40} />
      ) : (
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      )}
    </Paper>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboardSummaryQuery();
  const [logServiceAsset, setLogServiceAsset] = useState<ServiceableAsset | null>(null);

  const dueItems: DueServiceItem[] = useMemo(
    () =>
      (data?.upcomingServices ?? []).map((service) => ({
        assetId: service.customerAssetId,
        assetName: service.assetName,
        customerId: service.customerId,
        customerName: service.customerName,
        nextServiceDate: service.nextServiceDate,
        overdue: service.overdue,
      })),
    [data]
  );

  const assetsById = useMemo(() => {
    const map = new Map<string, ServiceableAsset>();
    for (const service of data?.upcomingServices ?? []) {
      map.set(service.customerAssetId, {
        id: service.customerAssetId,
        name: service.assetName,
        underAmc: true,
        serviceIntervalDays: service.serviceIntervalDays,
      });
    }
    return map;
  }, [data]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A quick look at your customers, assets, and what needs service.
        </Typography>
      </Box>

      {isError ? (
        <Typography color="error">Failed to load dashboard data. Please try again.</Typography>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard label="Customers" value={data?.totalCustomers ?? 0} icon={Users} color="#4C6FFF" isLoading={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard label="Assets" value={data?.totalAssets ?? 0} icon={PackageSearch} color="#00B37E" isLoading={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard label="Under AMC" value={data?.assetsUnderAmc ?? 0} icon={ShieldCheck} color="#8C54FF" isLoading={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Overdue Service"
                value={data?.overdueServiceCount ?? 0}
                icon={AlertTriangle}
                color="#F5222D"
                isLoading={isLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Due Soon (7 days)"
                value={data?.dueSoonServiceCount ?? 0}
                icon={CalendarClock}
                color="#FA8C16"
                isLoading={isLoading}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 7 }}>
              <DueServiceListCard title="Upcoming & overdue services" icon={CalendarClock}>
                <DueServiceList
                  items={dueItems}
                  isLoading={isLoading}
                  onLogService={(item) => {
                    const asset = assetsById.get(item.assetId);
                    if (asset) setLogServiceAsset(asset);
                  }}
                />
              </DueServiceListCard>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
                <Box sx={{ p: 2.5, pb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarClock size={18} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Recent activity
                  </Typography>
                </Box>
                {isLoading ? (
                  <Box sx={{ px: 2.5, pb: 2.5 }}>
                    <Skeleton height={40} />
                    <Skeleton height={40} />
                    <Skeleton height={40} />
                  </Box>
                ) : !data || data.recentActivity.length === 0 ? (
                  <Box sx={{ px: 2.5, pb: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Logged service visits will show up here.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {data.recentActivity.map((entry) => (
                      <Box
                        key={entry.id}
                        onClick={() => navigate(`/customers/${entry.customerId}`)}
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          borderTop: "1px solid",
                          borderColor: "divider",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {entry.assetName} — {entry.customerName}
                          </Typography>
                          <Chip
                            size="small"
                            label={entry.completed ? "Completed" : "Not completed"}
                            color={entry.completed ? "success" : "error"}
                            sx={{ flexShrink: 0 }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 0.5 }}>
                          {entry.remarks ? (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {entry.remarks}
                            </Typography>
                          ) : (
                            <span />
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                            {entry.serviceDate}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      <ServiceHistoryFormDialog
        open={!!logServiceAsset}
        asset={logServiceAsset ?? undefined}
        onClose={() => setLogServiceAsset(null)}
      />
    </Box>
  );
}
