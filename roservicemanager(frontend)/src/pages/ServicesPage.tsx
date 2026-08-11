import { useMemo, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { CalendarClock, History } from "lucide-react";
import { ServiceHistoryTable } from "@/components/tables/ServiceHistoryTable";
import { DueServiceList, DueServiceListCard, type DueServiceItem } from "@/components/common/DueServiceList";
import { ServiceHistoryFormDialog } from "@/components/dialogs/ServiceHistoryFormDialog";
import { useServiceHistoryAllQuery } from "@/hooks/useServiceHistoryQueries";
import { useDueAssetsQuery } from "@/hooks/useAssetQueries";
import type { ServiceableAsset } from "@/types/asset";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The services "hub" - due/overdue work and the full visit log live in one
 * place, with logging a visit (completed or not) happening inline via a
 * dialog instead of sending the user off to the asset's own page. That's
 * the whole point: someone chasing down due services shouldn't have to
 * jump between the Assets page, a customer's page, and back here just to
 * record one visit.
 */
export default function ServicesPage() {
  const [tab, setTab] = useState<"due" | "history">("due");

  const [duePage, setDuePage] = useState(0);
  const [duePageSize, setDuePageSize] = useState(10);
  const { data: dueData, isLoading: dueLoading, isError: dueError } = useDueAssetsQuery({
    page: duePage,
    size: duePageSize,
  });

  const [historyPage, setHistoryPage] = useState(0);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const { data: historyData, isLoading: historyLoading, isError: historyError } = useServiceHistoryAllQuery({
    page: historyPage,
    size: historyPageSize,
  });

  const [logServiceAsset, setLogServiceAsset] = useState<ServiceableAsset | null>(null);

  const today = todayIsoDate();
  const dueItems: DueServiceItem[] = useMemo(
    () =>
      (dueData?.content ?? [])
        .filter((asset) => !!asset.nextServiceDate)
        .map((asset) => ({
          assetId: asset.id,
          assetName: asset.name,
          customerId: asset.customerId,
          customerName: asset.customerName,
          nextServiceDate: asset.nextServiceDate as string,
          overdue: (asset.nextServiceDate as string) < today,
        })),
    [dueData, today]
  );

  const assetsById = useMemo(() => {
    const map = new Map<string, ServiceableAsset>();
    for (const asset of dueData?.content ?? []) {
      map.set(asset.id, {
        id: asset.id,
        name: asset.name,
        underAmc: asset.underAmc,
        serviceIntervalDays: asset.serviceIntervalDays,
      });
    }
    return map;
  }, [dueData]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Services
        </Typography>
        <Typography variant="body2" color="text.secondary">
          What needs service, and everything that's already been done - log a visit right from here.
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab value="due" label="Due & Upcoming" icon={<CalendarClock size={16} />} iconPosition="start" />
        <Tab value="history" label="History" icon={<History size={16} />} iconPosition="start" />
      </Tabs>

      {tab === "due" &&
        (dueError ? (
          <Typography color="error">Failed to load due services. Please try again.</Typography>
        ) : (
          <DueServiceListCard title="Due & overdue services" icon={CalendarClock}>
            <DueServiceList
              items={dueItems}
              isLoading={dueLoading}
              onLogService={(item) => {
                const asset = assetsById.get(item.assetId);
                if (asset) setLogServiceAsset(asset);
              }}
              pagination={{
                totalElements: dueData?.totalElements ?? 0,
                page: duePage,
                pageSize: duePageSize,
                onPageChange: setDuePage,
                onPageSizeChange: (size) => {
                  setDuePageSize(size);
                  setDuePage(0);
                },
              }}
            />
          </DueServiceListCard>
        ))}

      {tab === "history" &&
        (historyError ? (
          <Typography color="error">Failed to load service history. Please try again.</Typography>
        ) : (
          <ServiceHistoryTable
            entries={historyData?.content ?? []}
            totalElements={historyData?.totalElements ?? 0}
            page={historyPage}
            pageSize={historyPageSize}
            isLoading={historyLoading}
            showAssetColumn
            showCustomerColumn
            onPageChange={setHistoryPage}
            onPageSizeChange={(size) => {
              setHistoryPageSize(size);
              setHistoryPage(0);
            }}
          />
        ))}

      <ServiceHistoryFormDialog
        open={!!logServiceAsset}
        asset={logServiceAsset ?? undefined}
        onClose={() => setLogServiceAsset(null)}
      />
    </Box>
  );
}
