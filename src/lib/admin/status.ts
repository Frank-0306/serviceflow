export const REQUEST_STATUSES = ["new", "contacted", "scheduled", "completed", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const statusLabels: Record<RequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Short hint shown next to each status in the status picker. */
export const statusHints: Record<RequestStatus, string> = {
  new: "Not reviewed yet",
  contacted: "We reached out to the customer",
  scheduled: "Date and time confirmed",
  completed: "Visit done",
  cancelled: "Won't go ahead",
};

export function isRequestStatus(value: unknown): value is RequestStatus {
  return typeof value === "string" && (REQUEST_STATUSES as readonly string[]).includes(value);
}
