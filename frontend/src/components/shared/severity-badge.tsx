import type { Severity } from "@/lib/api/schemas";
import { SEVERITY_META } from "@/lib/severity";
import { cn } from "@/lib/utils";

export function SeverityBadge({
  severity,
  muted = false,
  className,
}: {
  severity: Severity;
  /** Toned down for alerts judged to be false positives. */
  muted?: boolean;
  className?: string;
}) {
  const meta = SEVERITY_META[severity];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-semibold whitespace-nowrap",
        muted ? "border-line bg-raised text-subtle" : [meta.border, meta.soft, meta.text],
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2.25} />
      {meta.label}
    </span>
  );
}
