export default function StatCard({
  label,
  value,
  delta,
  icon,
  iconColor = "#8FB4FF",
  iconBg = "rgba(143,180,255,0.14)",
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="card p-5 flex items-start gap-4">
      {icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-mono shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      )}
      <div>
        <div className="text-xs text-neige/50 mb-1">{label}</div>
        <div className="flex items-end gap-2">
          <span className="font-mono text-2xl font-semibold text-neige">{value}</span>
          {delta && <span className="text-xs text-vert font-mono mb-1">{delta}</span>}
        </div>
      </div>
    </div>
  );
}
