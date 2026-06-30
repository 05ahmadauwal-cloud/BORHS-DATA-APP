import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminAPI.getSettings(),
    select: (res) => res.data.settings,
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () => adminAPI.updateSettings(form),
    onSuccess: () => { toast.success('Settings saved'); queryClient.invalidateQueries({ queryKey: ['admin-settings'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const SETTING_GROUPS = [
    {
      title: 'App Configuration',
      fields: [
        { key: 'app_name', label: 'App Name', type: 'text' },
        { key: 'app_tagline', label: 'Tagline', type: 'text' },
        { key: 'support_email', label: 'Support Email', type: 'email' },
        { key: 'support_phone', label: 'Support Phone', type: 'text' },
      ],
    },
    {
      title: 'Wallet Limits',
      fields: [
        { key: 'min_wallet_fund', label: 'Minimum Fund Amount (₦)', type: 'number' },
        { key: 'max_wallet_fund', label: 'Maximum Fund Amount (₦)', type: 'number' },
      ],
    },
    {
      title: 'Referral Commission (%)',
      fields: [
        { key: 'referral_level1_percent', label: 'Level 1 Commission (%)', type: 'number' },
        { key: 'referral_level2_percent', label: 'Level 2 Commission (%)', type: 'number' },
        { key: 'referral_level3_percent', label: 'Level 3 Commission (%)', type: 'number' },
      ],
    },
    {
      title: 'Service Commission (%)',
      fields: [
        { key: 'data_commission_rate', label: 'Data Commission (%)', type: 'number' },
        { key: 'airtime_commission_rate', label: 'Airtime Commission (%)', type: 'number' },
      ],
    },
  ];

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dark-50 flex items-center gap-3"><Settings className="text-primary-400" />Platform Settings</h1>
          <p className="text-dark-400 text-sm">Configure platform-wide settings</p>
        </div>
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary gap-2">
          <Save size={16} />
          {mutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Maintenance Mode */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <p className="font-bold text-dark-100">Maintenance Mode</p>
          <p className="text-dark-400 text-sm">When enabled, users will see a maintenance page</p>
        </div>
        <button
          onClick={() => setForm({ ...form, maintenance_mode: !form.maintenance_mode })}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            form.maintenance_mode ? 'bg-red-500' : 'bg-dark-600'
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${form.maintenance_mode ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {SETTING_GROUPS.map((group) => (
        <div key={group.title} className="card p-6">
          <h2 className="text-lg font-bold text-dark-100 mb-5">{group.title}</h2>
          <div className="grid grid-cols-2 gap-5">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                <input
                  type={field.type}
                  className="input"
                  value={form[field.key] || ''}
                  onChange={(e) => setForm({ ...form, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
