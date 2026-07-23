import { LayoutDashboard } from "lucide-react";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function DashboardPage() {
  return (
    <ComingSoon
      title="Dashboard Coming Soon"
      description="Analytics, revenue summaries, and service reminders will appear here once the reporting APIs are ready."
      icon={LayoutDashboard}
    />
  );
}
