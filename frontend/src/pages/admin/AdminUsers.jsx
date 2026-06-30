import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { Users, Search, UserX, UserCheck, Wallet, ChevronDown } from 'lucide-react';
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
    onSuccess: () => {
      toast.success('Wallet adjusted');
      setShowAdjust(false);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-dark-50 flex items-center gap-2">
            <Users size={22} className="text-primary-400" /> User Management
          </h1>
          <p className="text-dark-400 text-xs mt-0.5">{data?.pagination?.total || 0} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 md:p-4 flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 flex-1">
          <Search size={14} className="text-dark-400 shrink-0" />
          <input
            className="bg-transparent text-sm text-dark-200 placeholder-dark-500 focus:outline-none flex-1 min-w-0"
            placeholder="Search name, email, phone..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="flex-1 sm:flex-none bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-sm text-dark-200 focus:outline-none focus:border-primary-500"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
          <select
            className="flex-1 sm:flex-none bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-sm text-dark-200 focus:outline-none focus:border-primary-500"
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Suspended</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block table-container">
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
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div className="h-4 bg-dark-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : data?.data?.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div>
                        <p className="font-semibold text-dark-100 text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-dark-400">{user.email}</p>
                      </div>
                    </td>
                    <td><span className="badge-info capitalize text-xs">{user.role?.replace('_', ' ')}</span></td>
                    <td><span className="font-bold text-success-500 text-sm">₦{(user.walletBalance || 0).toLocaleString()}</span></td>
                    <td><span className="badge-gray uppercase text-xs">{user.kycStatus || 'none'}</span></td>
                    <td>
                      <span className={`badge text-xs ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
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
                            onClick={() => { const r = prompt('Suspension reason:'); if (r) suspendMutation.mutate({ id: user._id, reason: r }); }}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <UserX size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => activateMutation.mutate(user._id)}
                            className="p-1.5 rounded-lg bg-success-500/10 text-success-500 hover:bg-success-500/20 transition-colors"
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

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-dark-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-dark-700 rounded w-2/3" />
                    <div className="h-3 bg-dark-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          : data?.data?.map((user) => (
              <div key={user._id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-primary-400 font-bold text-sm">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-dark-100 text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-dark-400 truncate">{user.email}</p>
                      </div>
                      <span className={`badge text-xs shrink-0 ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="badge-info capitalize text-xs">{user.role?.replace('_', ' ')}</span>
                        <span className="font-bold text-success-500 text-xs">₦{(user.walletBalance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setSelectedUser(user); setShowAdjust(true); }}
                          className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400"
                        >
                          <Wallet size={13} />
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => { const r = prompt('Reason:'); if (r) suspendMutation.mutate({ id: user._id, reason: r }); }}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400"
                          >
                            <UserX size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => activateMutation.mutate(user._id)}
                            className="p-1.5 rounded-lg bg-success-500/10 text-success-500"
                          >
                            <UserCheck size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dark-400">
            Page {filters.page} of {data.pagination.pages} · {data.pagination.total} users
          </p>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="btn-secondary btn-sm">Prev</button>
            <button disabled={!data.pagination.hasNext} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="btn-secondary btn-sm">Next</button>
          </div>
        </div>
      )}

      {/* Adjust Wallet Modal */}
      {showAdjust && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="card p-5 w-full sm:max-w-md space-y-4 rounded-b-none sm:rounded-2xl">
            <div className="w-10 h-1 bg-dark-600 rounded-full mx-auto sm:hidden mb-1" />
            <h3 className="text-base font-bold text-dark-100">
              Adjust Wallet — {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            <p className="text-dark-400 text-sm">Balance: <span className="text-success-500 font-bold">₦{(selectedUser.walletBalance || 0).toLocaleString()}</span></p>
            <div className="grid grid-cols-2 gap-2">
              {['credit', 'debit'].map((t) => (
                <button key={t} onClick={() => setAdjustForm({ ...adjustForm, type: t })}
                  className={`py-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                    adjustForm.type === t
                      ? t === 'credit' ? 'border-success-500 bg-success-500/10 text-success-500' : 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-dark-600 text-dark-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input type="number" className="input" placeholder="Amount (₦)" value={adjustForm.amount}
              onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })} />
            <input className="input" placeholder="Reason for adjustment" value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} />
            <div className="flex gap-3">
              <button onClick={() => setShowAdjust(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => adjustMutation.mutate()}
                disabled={!adjustForm.amount || !adjustForm.reason || adjustMutation.isPending}
                className="btn-primary flex-1"
              >
                {adjustMutation.isPending ? 'Saving...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
