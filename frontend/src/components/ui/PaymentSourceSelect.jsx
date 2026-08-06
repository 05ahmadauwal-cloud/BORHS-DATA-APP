import { Wallet, Gift, Layers } from 'lucide-react';

const OPTIONS = [
  { value: 'main', label: 'Main wallet', Icon: Wallet, balanceKey: 'walletBalance' },
  { value: 'reward', label: 'Reward wallet', Icon: Gift, balanceKey: 'rewardBalance' },
  { value: 'reward_first', label: 'Rewards first', Icon: Layers, description: 'Use rewards, then main wallet' },
];

export default function PaymentSourceSelect({ value, onChange, user }) {
  return (
    <div>
      <label className="label">Pay from</label>
      <div className="grid gap-2 sm:grid-cols-3">
        {OPTIONS.map(({ value: option, label, Icon, balanceKey, description }) => (
          <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-xl border p-3 text-left transition-all ${value === option ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 bg-dark-700/30'}`}>
            <span className="flex items-center gap-2 text-xs font-bold text-dark-100"><Icon size={15} className={value === option ? 'text-primary-400' : 'text-dark-400'} />{label}</span>
            <span className="mt-1 block text-[10px] text-dark-400">{description || `₦${Number(user?.[balanceKey] || 0).toLocaleString()}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
