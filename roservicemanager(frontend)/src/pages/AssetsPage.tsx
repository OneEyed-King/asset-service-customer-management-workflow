import { PackageSearch } from "lucide-react";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function AssetsPage() {
  return (
    <ComingSoon
      title="Asset Module Coming Next"
      description="Customer asset tracking will be built after the Customer module milestone."
      icon={PackageSearch}
    />
  );
}
