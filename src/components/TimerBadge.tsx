type TimerBadgeProps = {
  countdown: number;
  lastUpdated: string | null;
};

export const TimerBadge = ({ countdown, lastUpdated }: TimerBadgeProps): JSX.Element => (
  <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">
    <p>Next refresh in: <span className="font-semibold text-cyan-300">{countdown}s</span></p>
    <p className="text-xs text-slate-400">Last updated: {lastUpdated ?? 'Never'}</p>
  </div>
);
