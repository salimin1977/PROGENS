interface FunnelStageData {
  label: string;
  count: number;
}

export default function Funnel({ stages }: { stages: FunnelStageData[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div className="space-y-2">
      {stages.map((stage, idx) => {
        const widthPct = Math.max(12, (stage.count / max) * 100);
        return (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="w-32 shrink-0 text-right text-xs font-semibold text-slate-500">{stage.label}</div>
            <div className="flex-1">
              <div
                className="flex h-9 items-center justify-end rounded-md px-3 text-sm font-bold text-white shadow-sm"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, #0d1c33, #166b66 ${100 - idx * 8}%)`,
                }}
              >
                {stage.count}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
