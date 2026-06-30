import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { Users, Search, UserX, UserCheck, Wallet, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', role: '', isActive: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ amount: '', type: 'credit', reason: '' });
  const [showAdjust, setShowAdjust] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminAPI.getUsers(filters),
    select: (res) => res.data,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.suspendUser(id, reason),
    onSuccess: () => { toast.success('User suspended'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => adminAPI.activateUser(id),
    onSuccess: () => { toast.success('User activated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const adjustMutation = useMutation({
    mutationFn: () => adminAPI.adjustWallet(selectedUser._id, adjustForm),
    onSuccess: () => { toast.success('Wallet adjusted'); setShowAdjust(false); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dark-50 flex items-center gap-3"><Users className="text-primary-400" />User Management</h1>
          <p className="text-dark-400 text-sm">{data?.pagination?.total || 0} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-dark-400" />
          <input
            className="bg-transparent text-sm text-dark-200 placeholder-dark-500 focus:outline-none flex-1"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <select
          className="bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-sm text-dark-200 focus:outline-none"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select
          className="bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-sm text-dark-200 focus:outline-none"
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Balance</th>
              <th>KYC</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={7}><div className="h-8 bg-dark-700 rounded animate-pulse" /></td></tr>
              ))
            ) : data?.data?.map((user) => (
              <tr key={user._id}>
                <td>
                  <div>
                    <p className="font-semibold text-dark-100">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-dark-400">{user.email}</p>
                    <p className="text-xs text-dark-500">{user.phone}</p>
                  </div>
                </td>
                <td><span className="badge-info capitalize">{user.role?.replace('_', ' ')}</span></td>
                <td><span className="font-semibold text-success-500">₦{(user.walletBalance || 0).toLocaleString()}</span></td>
                <td><span className="badge-gray uppercase">{user.kycStatus || 'none'}</span></td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="text-dark-400 text-xs">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</td>
                <td>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setSelectedUser(user); setShowAdjust(true); }}
                      className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors"
                      title="Adjust Wallet"
                    >
                      <Wallet size={13} />
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => {
                          const reason = prompt('Suspension reason:');
                          if (reason) suspendMutation.mutate({ id: user._id, reason });
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Suspend"
                      >
                        <UserX size={13} />
                      </button>
                    ) : (
                      <button
                        onClick={() => activateMutation.mutate(user._id)}
                        className="p-1.5 rounded-lg bg-success-500/10 text-success-500 hover:bg-success-500/20 transition-colors"
                        title="Activate"
                      >
                        <UserCheck size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dark-400">Page {filters.page} of {data.pagination.pages}</p>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="btn-secondary btn-sm">Prev</button>
            <button disabled={!data.pagination.hasNext} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="btn-secondary btn-sm">Next</button>
          </div>
        </div>
      )}

      {/* Adjust Wallet Modal */}
      {showAdjust && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-dark-100">Adjust Wallet — {selectedUser.firstName} {selectedUser.lastName}</h3>
            <p className="text-dark-400 text-sm">Current balance: ₦{(selectedUser.walletBalance || 0).toLocaleString()}</p>
            <div className="grid grid-cols-2 gap-3">
              {['credit', 'debit'].map((t) => (
                <button key={t} onClick={() => setAdjustForm({ ...adjustForm, type: t })}
                  className={`py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${
                    adjustForm.type === t ? t === 'credit' ? 'border-success-500 bg-success-500/10 text-success-500' : 'border-red-500 bg-red-500/10 text-red-400' : 'border-dark-600 text-dark-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input type="number" className="input" placeholder="Amount" value={adjustForm.amount} onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })} />
            <input className="input" placeholder="Reason" value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} />
            <div className="flex gap-3">
              <button onClick={() => setShowAdjust(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => adjustMutation.mutate()} disabled={adjustMutation.isPending} className="btn-primary flex-1">
                {adjustMutation.isPending ? 'Processing...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
