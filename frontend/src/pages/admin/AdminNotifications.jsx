import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { Megaphone, Send, Users, User, UserCheck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TARGETS = [
  { id: 'all', label: 'Everyone', desc: 'All registered users', icon: Users },
  { id: 'customer', label: 'Customers', desc: 'Regular customers only', icon: User },
  { id: 'agent', label: 'Agents', desc: 'Agents only', icon: UserCheck },
];

const EMPTY = { title: '', message: '', targetRole: 'all' };

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['broadcast-history'],
    queryFn: () => adminAPI.broadcastHistory(),
    select: (res) => res.data?.history || [],
  });

  const broadcastMutation = useMutation({
    mutationFn: () => adminAPI.broadcast(form),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Announcement sent!');
      queryClient.invalidateQueries({ queryKey: ['broadcast-history'] });
      setForm(EMPTY);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send announcement'),
  });

  const charLeft = 300 - form.message.length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Announcements</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Send in-app notifications to users on their dashboard
        </p>
      </div>

      {/* Compose card */}
      <div className="card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-primary-400" />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>New Announcement</h3>
        </div>

        {/* Target audience */}
        <div>
          <label className="label">Send to</label>
          <div className="grid grid-cols-3 gap-2">
            {TARGETS.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setForm({ ...form, targetRole: id })}
                className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
                  form.targetRole === id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 hover:border-primary-500/30'
                }`}
              >
                <Icon size={16} className={form.targetRole === id ? 'text-primary-400' : 'text-dark-500'} />
                <p className={`text-xs font-bold mt-1.5 ${form.targetRole === id ? 'text-primary-300' : 'text-dark-300'}`}>
                  {label}
                </p>
                <p className="text-[10px] text-dark-500 mt-0.5 leading-tight">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            placeholder="e.g. Service Update, New Feature, Downtime Notice…"
            value={form.title}
            maxLength={100}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Message</label>
            <span className="text-[11px]" style={{ color: charLeft < 20 ? '#f87171' : 'var(--text-faint)' }}>
              {charLeft} chars left
            </span>
          </div>
          <textarea
            className="input resize-none"
            rows={4}
            placeholder="Write your announcement here…"
            value={form.message}
            maxLength={300}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>

        <button
          onClick={() => broadcastMutation.mutate()}
          disabled={!form.title.trim() || !form.message.trim() || broadcastMutation.isPending}
          className="btn-primary w-full gap-2"
        >
          {broadcastMutation.isPending
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send size={15} />}
          {broadcastMutation.isPending ? 'Sending…' : 'Send Announcement'}
        </button>
      </div>

      {/* History */}
      <div>
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>Recent Announcements</h3>
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Megaphone size={26} className="mx-auto opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No announcements sent yet.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {history.map((item, i) => (
                <div key={i} className="p-4 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item._id.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0 font-bold"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      {item.targetRole === 'all' ? 'Everyone' : item.targetRole}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item._id.message}</p>
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    <Clock size={11} />
                    <span>{format(new Date(item.sentAt), 'MMM dd, yyyy · h:mm a')}</span>
                    <span>·</span>
                    <span>{item.count} recipient{item.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
