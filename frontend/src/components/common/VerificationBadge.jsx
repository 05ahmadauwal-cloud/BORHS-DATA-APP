import { BadgeCheck, Clock } from 'lucide-react';

const VERIFIED_KYC = ['tier1', 'tier2', 'tier3', 'verified', 'approved'];

export default function VerificationBadge({ user, compact = false }) {
  if (!user) return null;

  const role = user.role || 'customer';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isAgent = role === 'agent';
  const isVerifiedCustomer = role === 'customer'
    && user.isEmailVerified
    && VERIFIED_KYC.includes(user.kycStatus);
  const isVerified = isAdmin || isAgent || isVerifiedCustomer;

  const label = isAdmin
    ? (role === 'super_admin' ? 'Verified Super Admin' : 'Verified Admin')
    : isAgent
      ? 'Verified Agent'
      : isVerifiedCustomer
        ? 'Verified Customer'
        : 'Verification Pending';

  const colors = isAdmin
    ? 'border-violet-500/30 bg-violet-500/10 text-violet-400'
    : isAgent
      ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
      : isVerified
        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
        : 'border-dark-600 bg-dark-700/50 text-dark-400';

  const Icon = isVerified ? BadgeCheck : Clock;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${colors} ${
        compact || isVerified ? 'h-6 w-6 justify-center' : 'gap-1.5 px-2.5 py-1 text-[11px]'
      }`}
      title={label}
      aria-label={label}
    >
      <Icon size={compact || isVerified ? 14 : 13} strokeWidth={2.5} />
      {!compact && !isVerified && label}
    </span>
  );
}
