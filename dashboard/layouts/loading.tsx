import { CircularSpinner } from "@/dashboard/components/ui/circular-spinner";

export function DashboardLoading() {
  return <div className="grid min-h-svh place-items-center" aria-label="جاري التحميل">
    <CircularSpinner size={36} />
  </div>;
}
