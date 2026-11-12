const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Splits an ISO timestamp into a short local date and 24h time. */
export function formatTimestamp(iso: string): { date: string; time: string } {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: iso, time: "" };
  return { date: dateFormat.format(parsed), time: timeFormat.format(parsed) };
}

const WORD_CASING: Record<string, string> = {
  c2: "C2",
  dns: "DNS",
  ip: "IP",
  powershell: "PowerShell",
  pua: "PUA",
  rdp: "RDP",
  ssh: "SSH",
  sso: "SSO",
  vpn: "VPN",
};

/** "outbound_c2_beacon" -> "Outbound C2 beacon" */
export function humanizeEventType(eventType: string): string {
  const words = eventType
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => WORD_CASING[word.toLowerCase()] ?? word.toLowerCase());
  if (words.length === 0) return "Unknown event";
  const [first, ...rest] = words;
  return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(" ");
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
