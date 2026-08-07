export default function AutoRenewalOption({ enabled, onEnabledChange, frequency, onFrequencyChange }) {
  return (
    <div className="rounded-xl border border-dark-600 bg-dark-700/30 p-3">
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span><span className="block text-sm font-bold text-dark-100">Auto-renew this purchase</span><span className="block text-[11px] text-dark-400">You can pause or cancel it later.</span></span>
        <input type="checkbox" checked={enabled} onChange={(event) => onEnabledChange(event.target.checked)} className="h-5 w-5 accent-primary-500" />
      </label>
      {enabled && <select className="input mt-3" value={frequency} onChange={(event) => onFrequencyChange(event.target.value)}><option value="daily">Every day</option><option value="weekly">Every week</option><option value="monthly">Every month</option></select>}
    </div>
  );
}
