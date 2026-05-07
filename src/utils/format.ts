// Currency + number formatting utilities (INR-first)

export const formatINR = (n: number, opts?: { compact?: boolean }) => {
  if (opts?.compact) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

export const formatNumber = (n: number) => new Intl.NumberFormat("en-IN").format(n);
export const formatPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
