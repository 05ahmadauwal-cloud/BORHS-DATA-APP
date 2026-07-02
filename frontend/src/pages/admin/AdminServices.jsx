import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import api from '../../api/axios';
import {
  Zap, Plus, Edit, Trash2, ToggleLeft, ToggleRight,
  RefreshCw, Percent, CheckCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { NetworkLogo } from '../../components/NetworkLogo';

const EMPTY_PLAN = {
  network: 'mtn', dataType: 'sme', planId: '', name: '',
  dataSize: '', validity: '', costPrice: '', sellingPrice: '',
  agentPrice: '', providerPlanCode: '',
};

export default function AdminServices() {
  const queryClient = useQueryClient();
  const [filterNetwork, setFilterNetwork] = useState('');
  const [filterDataType, setFilterDataType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_PLAN);
  const [tab, setTab] = useState('plans'); // 'plans' | 'commission'

  // Commission rates state
  const [rates, setRates] = useState({ customer: 10, agent: 5, reseller: 3 });

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['admin-data-plans', filterNetwork, filterDataType],
    queryFn: () => adminAPI.getDataPlans({ network: filterNetwork, dataType: filterDataType }),
    select: (res) => res.data.plans,
  });

  const { data: savedRates } = useQuery({
    queryKey: ['commission-rates'],
    queryFn: () => api.get('/admin/sync/commission-rates'),
    select: (res) => res.data,
    onSuccess: (data) => setRates(data),
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const syncMutation = useMutation({
    mutationFn: () => api.post('/admin/sync/data-plans', { commissionRates: rates }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Sync failed. Check SMEAPI token.'),
  });

  const updateCommissionMutation = useMutation({
    mutationFn: () => api.post('/admin/sync/update-commissions', rates),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] });
      queryClient.invalidateQueries({ queryKey: ['commission-rates'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const createMutation = useMutation({
    mutationFn: () => adminAPI.createDataPlan(form),
    onSuccess: () => {
      toast.success('Plan created');
      queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] });
      setShowForm(false); setForm(EMPTY_PLAN);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: () => adminAPI.updateDataPlan(editPlan._id, form),
    onSuccess: () => {
      toast.success('Plan updated');
      queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] });
      setShowForm(false); setEditPlan(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteDataPlan(id),
    onSuccess: () => { toast.success('Plan deleted'); queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] }); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => adminAPI.updateDataPlan(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] }),
  });

  const openEdit = (plan) => { setForm({ ...plan }); setEditPlan(plan); setShowForm(true); };
  const openCreate = () => { setForm(EMPTY_PLAN); setEditPlan(null); setShowForm(true); };

  const profit = (plan) => plan.sellingPrice - plan.costPrice;
  const margin = (plan) => plan.costPrice > 0
    ? (((plan.sellingPrice - plan.costPrice) / plan.costPrice) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-dark-50 flex items-center gap-2">
            <Zap size={22} className="text-primary-400" /> Services & Data Plans
          </h1>
          <p className="text-dark-400 text-xs mt-0.5">{plans?.length || 0} plans · SMEAPI</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCreate} className="btn-secondary btn-sm gap-1.5"><Plus size={14} /> Add Plan</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl w-fit">
        {[['plans', 'Data Plans'], ['commission', 'Commission & Sync']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-dark-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Commission & Sync tab ─────────────────────────────────────────── */}
      {tab === 'commission' && (
        <div className="space-y-5 max-w-2xl">

          {/* How it works */}
          <div className="card p-5 bg-primary-500/5 border-primary-500/20">
            <h3 className="font-bold text-dark-100 mb-3 flex items-center gap-2">
              <Percent size={16} className="text-primary-400" /> How Commission Works
            </h3>
            <div className="space-y-2 text-sm text-dark-300">
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-success-500 mt-0.5 shrink-0" />
                <p><span className="text-dark-100 font-semibold">SMEAPI price</span> = what you pay (your cost)</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-success-500 mt-0.5 shrink-0" />
                <p><span className="text-dark-100 font-semibold">Customer price</span> = cost + your commission % (what they pay)</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-success-500 mt-0.5 shrink-0" />
                <p><span className="text-dark-100 font-semibold">Agent price</span> = cost + lower % (agents buy cheaper, earn own commission)</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                <p>Click <span className="text-primary-400 font-semibold">Sync from SMEAPI</span> first to pull live prices, then set your commission.</p>
              </div>
            </div>
          </div>

          {/* Commission rate inputs */}
          <div className="card p-5 space-y-5">
            <h3 className="font-bold text-dark-100">Your Commission Rates</h3>

            <div className="space-y-4">
              {[
                { key: 'customer', label: 'Customer Commission', desc: 'Regular customers pay this above SMEAPI price', color: 'text-primary-400' },
                { key: 'agent', label: 'Agent Commission', desc: 'Agents pay less — they sell to their own customers', color: 'text-success-500' },
                { key: 'reseller', label: 'Reseller Commission', desc: 'Bulk resellers get the lowest price', color: 'text-purple-400' },
              ].map(({ key, label, desc, color }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <label className="text-sm font-semibold text-dark-100">{label}</label>
                      <p className="text-xs text-dark-400">{desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-dark-700 border border-dark-600 rounded-xl px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        className="bg-transparent text-right w-16 text-base font-black focus:outline-none text-dark-100"
                        value={rates[key]}
                        onChange={(e) => setRates({ ...rates, [key]: parseFloat(e.target.value) || 0 })}
                      />
                      <span className={`text-lg font-black ${color}`}>%</span>
                    </div>
                  </div>
                  {/* Example calculation */}
                  <div className="bg-dark-800/60 rounded-lg px-3 py-2 text-xs text-dark-400">
                    e.g. SMEAPI price ₦270 → {label.split(' ')[0]} pays{' '}
                    <span className={`font-bold ${color}`}>
                      ₦{Math.ceil(270 * (1 + rates[key] / 100)).toLocaleString()}
                    </span>
                    {' '}· Profit: <span className="text-success-500 font-bold">₦{Math.ceil(270 * (rates[key] / 100))}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-dark-700">
              <button
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                className="btn-primary flex-1 gap-2"
              >
                {syncMutation.isPending
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <RefreshCw size={15} />
                }
                {syncMutation.isPending ? 'Syncing from SMEAPI...' : 'Sync from SMEAPI + Apply Commission'}
              </button>
              <button
                onClick={() => updateCommissionMutation.mutate()}
                disabled={updateCommissionMutation.isPending}
                className="btn-secondary flex-1 gap-2"
              >
                <Percent size={15} />
                {updateCommissionMutation.isPending ? 'Updating...' : 'Update Commission Only'}
              </button>
            </div>
            <p className="text-xs text-dark-500">
              <span className="text-primary-400 font-semibold">Sync</span> pulls fresh prices from SMEAPI AND applies commission.{' '}
              <span className="text-dark-400 font-semibold">Update Commission Only</span> recalculates prices on existing plans without re-syncing.
            </p>
          </div>
        </div>
      )}

      {/* ── Plans tab ─────────────────────────────────────────────────────── */}
      {tab === 'plans' && (
        <>
          {/* Filters */}
          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] text-dark-500 font-bold uppercase self-center shrink-0">Network</span>
              {['', 'mtn', 'airtel', 'glo', '9mobile'].map((n) => (
                <button key={n} onClick={() => setFilterNetwork(n)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-all ${
                    filterNetwork === n
                      ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                      : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-600'
                  }`}
                >
                  {n || 'All'}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] text-dark-500 font-bold uppercase self-center shrink-0">Type</span>
              {['', 'sme', 'corporate', 'gifting', 'direct'].map((t) => (
                <button key={t} onClick={() => setFilterDataType(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-all ${
                    filterDataType === t
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-600'
                  }`}
                >
                  {t || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Network</th>
                  <th>Size</th>
                  <th>SMEAPI Cost</th>
                  <th>Customer Price</th>
                  <th>Agent Price</th>
                  <th>Profit</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {plansLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j}><div className="h-4 bg-dark-700 rounded animate-pulse" /></td>)}</tr>
                    ))
                  : plans?.map((plan) => (
                      <tr key={plan._id}>
                        <td>
                          <p className="font-semibold text-dark-100 text-sm">{plan.name}</p>
                          <p className="text-xs text-dark-500 font-mono">{plan.planId}</p>
                        </td>
                        <td>
                          <NetworkLogo network={plan.network} size="sm" />
                          {plan.dataType && <span className="ml-1 text-[10px] text-dark-500 capitalize">{plan.dataType}</span>}
                        </td>
                        <td className="font-bold text-dark-100">{plan.dataSize}</td>
                        <td className="text-dark-400">₦{plan.costPrice?.toLocaleString()}</td>
                        <td className="font-bold text-primary-400">₦{plan.sellingPrice?.toLocaleString()}</td>
                        <td className="text-success-500">₦{plan.agentPrice?.toLocaleString() || '-'}</td>
                        <td>
                          <span className="text-success-500 font-bold text-xs">
                            +₦{profit(plan).toLocaleString()} ({margin(plan)}%)
                          </span>
                        </td>
                        <td>
                          <button onClick={() => toggleMutation.mutate({ id: plan._id, isActive: !plan.isActive })}>
                            {plan.isActive
                              ? <ToggleRight size={22} className="text-success-500" />
                              : <ToggleLeft size={22} className="text-dark-500" />}
                          </button>
                        </td>
                        <td>
                          <div className="flex gap-1.5">
                            <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20"><Edit size={12} /></button>
                            <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(plan._id); }} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {plansLoading
              ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse" />)
              : plans?.map((plan) => (
                  <div key={plan._id} className="card p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <NetworkLogo network={plan.network} size="sm" />
                        <p className="font-bold text-dark-100 text-sm mt-1">{plan.name}</p>
                        <p className="text-xs text-dark-500 font-mono">{plan.planId}</p>
                      </div>
                      <button onClick={() => toggleMutation.mutate({ id: plan._id, isActive: !plan.isActive })}>
                        {plan.isActive ? <ToggleRight size={22} className="text-success-500" /> : <ToggleLeft size={22} className="text-dark-500" />}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-dark-700/50 rounded-lg p-2">
                        <p className="text-[10px] text-dark-500">Cost</p>
                        <p className="text-xs font-bold text-dark-300">₦{plan.costPrice?.toLocaleString()}</p>
                      </div>
                      <div className="bg-primary-500/10 rounded-lg p-2">
                        <p className="text-[10px] text-dark-500">Customer</p>
                        <p className="text-xs font-bold text-primary-400">₦{plan.sellingPrice?.toLocaleString()}</p>
                      </div>
                      <div className="bg-success-500/10 rounded-lg p-2">
                        <p className="text-[10px] text-dark-500">Profit</p>
                        <p className="text-xs font-bold text-success-500">+{margin(plan)}%</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(plan)} className="btn-secondary btn-sm flex-1 gap-1"><Edit size={12} /> Edit</button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(plan._id); }} className="btn-sm flex-1 gap-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl"><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                ))}
          </div>
        </>
      )}

      {/* ── Plan Form Modal ───────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-auto">
          <div className="card p-5 w-full sm:max-w-2xl space-y-4 rounded-b-none sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-dark-600 rounded-full mx-auto sm:hidden" />
            <h3 className="text-base font-bold text-dark-100">{editPlan ? 'Edit Plan' : 'Add Data Plan'}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Network', 'network', 'select', ['mtn', 'airtel', 'glo', '9mobile']],
                ['Type', 'dataType', 'select', ['sme', 'corporate', 'gifting', 'direct']],
                ['Plan ID / Code', 'planId', 'text'],
                ['Plan Name', 'name', 'text'],
                ['Data Size', 'dataSize', 'text'],
                ['Validity', 'validity', 'text'],
                ['SMEAPI Cost (₦)', 'costPrice', 'number'],
                ['Customer Price (₦)', 'sellingPrice', 'number'],
                ['Agent Price (₦)', 'agentPrice', 'number'],
                ['Provider Code', 'providerPlanCode', 'text'],
              ].map(([label, key, type, options]) => (
                <div key={key} className={key === 'name' ? 'col-span-2' : ''}>
                  <label className="label text-xs">{label}</label>
                  {type === 'select' ? (
                    <select className="input text-sm py-2" value={form[key] || ''}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                      {options.map((o) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                    </select>
                  ) : (
                    <input type={type} className="input text-sm py-2" value={form[key] || ''}
                      placeholder={label}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
            {/* Live profit preview */}
            {form.costPrice && form.sellingPrice && (
              <div className="bg-success-500/10 border border-success-500/20 rounded-xl p-3 text-sm">
                Profit: <span className="font-black text-success-500">
                  ₦{(Number(form.sellingPrice) - Number(form.costPrice)).toLocaleString()}
                </span>
                {' '}({(((form.sellingPrice - form.costPrice) / form.costPrice) * 100).toFixed(1)}% margin)
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => editPlan ? updateMutation.mutate() : createMutation.mutate()}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary flex-1"
              >
                {editPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
