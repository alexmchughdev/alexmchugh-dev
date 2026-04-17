export default function SectionHeader({
  command,
  title,
}: {
  command: string;
  title: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
      <div className="font-mono text-sm">
        <span className="text-prompt">alex@mchugh</span>
        <span className="text-ink">:</span>
        <span className="text-path">~</span>
        <span className="mx-1 text-ink">$</span>
        <span className="text-ink">{command}</span>
      </div>
      <div className="hidden font-mono text-xs uppercase tracking-wider text-ink-faint md:block">
        # {title}
      </div>
    </div>
  );
}
