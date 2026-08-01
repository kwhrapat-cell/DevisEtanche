export default function StatCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs text-ardoise/50 mb-2">{label}</div>
      <div className="flex items-end gap-2">
        <span className="font-mono text-2xl font-semibold text-ardoise">{value}</span>
        {delta && <span className="text-xs text-vert font-mono mb-1">{delta}</span>}
      </div>
    </div>
  );
}
