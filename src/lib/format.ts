export const formatKES = (n: number) =>
  `KES ${Math.round(n).toLocaleString("en-KE")}`;

export const formatDate = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const daysUntil = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

export const padId = (prefix: string, n: number, width = 4) =>
  `${prefix}-${String(n).padStart(width, "0")}`;