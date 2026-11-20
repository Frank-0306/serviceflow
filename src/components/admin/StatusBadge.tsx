import { statusLabels, type RequestStatus } from "@/lib/admin/status";

/** Status always shows its text label; color only reinforces it. */
const styles: Record<RequestStatus, { chip: string; dot: string }> = {
  new: { chip: "bg-[#e3e9f2] text-navy", dot: "bg-navy" },
  contacted: { chip: "bg-[#f1e7d2] text-[#6a4f17]", dot: "bg-[#b0873a]" },
  scheduled: { chip: "bg-[#dfe6dc] text-moss", dot: "bg-moss" },
  completed: { chip: "bg-moss text-ivory", dot: "bg-ivory" },
  cancelled: { chip: "bg-[#ebe7df] text-muted", dot: "bg-muted/60" },
};

export function StatusBadge({ status, className = "" }: { status: RequestStatus; className?: string }) {
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2 py-0.5 text-xs font-medium whitespace-nowrap ${s.chip} ${className}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {statusLabels[status]}
    </span>
  );
}
