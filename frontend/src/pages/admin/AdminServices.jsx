import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { Zap, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_PLAN = { network: 'mtn', dataType: 'sme', planId: '', name: '', dataSize: '', validity: '', costPrice: '', sellingPrice: '', agentPrice: '', providerPlanCode: '' };

export default function AdminServices() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_PLAN);
  const [filterNetwork, setFilterNetwork] = useState('');

  const { data: plans } = useQuery({
    queryKey: ['admin-data-plans', filterNetwork],
    queryFn: () => adminAPI.getDataPlans({ network: filterNetwork }),
    select: (res) => res.data.plans,
  });

  const createMutation = useMutation({
    mutationFn: () => adminAPI.createDataPlan(form),
    onSuccess: () => { toast.success('Plan created'); queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] }); setShowForm(false); setForm(EMPTY_PLAN); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: () => adminAPI.updateDataPlan(editPlan._id, form),
    onSuccess: () => { toast.success('Plan updated'); queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] }); setEditPlan(null); setShowForm(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteDataPlan(id),
    onSuccess: () => { toast.success('Plan deleted'); queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => adminAPI.updateDataPlan(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-data-plans'] }),
  });

  const openCreate = () => { setForm(EMPTY_PLAN); setEditPlan(null); setShowForm(true); };
  const openEdit = (plan) => { setForm({ ...plan }); setEditPlan(plan); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dark-50 flex items-center gap-3"><Zap className="text-primary-400" />Services & Data Plans</h1>
          <p className="text-dark-400 text-sm">{plans?.length || 0} plans configured</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2"><Plus size={16} /> Add Plan</button>
      </div>

      {/* Network Filter */}
      <div className="flex gap-2">
        {['', 'mtn', 'airtel', 'glo', '9mobile'].map((n) => (
          <button key={n} onClick={() => setFilterNetwork(n)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
              filterNetwork === n ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
            }`}
          >
            {n || 'All'}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Network</th>
              <th>Type</th>
              <th>Size</th>
              <th>Cost</th>
              <th>Selling</th>
              <th>Agent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans?.map((plan) => (
              <tr key={plan._id}>
                <td className="font-medium text-dark-100">{plan.name}</td>
                <td><span className={`network-badge network-${plan.network}`}>{plan.network}</span></td>
                <td className="capitalize text-dark-300 text-xs">{plan.dataType}</td>
                <td className="font-semibold text-dark-100">{plan.dataSize}</td>
                <td className="text-dark-300">₦{plan.costPrice?.toLocaleString()}</td>
                <td className="font-bold text-success-500">₦{plan.sellingPrice?.toLocaleString()}</td>
                <td className="text-dark-300">₦{plan.agentPrice?.toLocaleString() || '-'}</td>
                <td>
                  <button onClick={() => toggleMutation.mutate({ id: plan._id, isActive: !plan.isActive })}>
                    {plan.isActive
                      ? <ToggleRight size={20} className="text-success-500" />
                      : <ToggleLeft size={20} className="text-dark-500" />}
                  </button>
                </td>
                <td>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20"><Edit size={12} /></button>
                    <button onClick={() => { if (confirm('Delete this plan?')) deleteMutation.mutate(plan._id); }} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="card p-6 w-full max-w-2xl space-y-4 my-4">
            <h3 className="text-lg font-bold text-dark-100">{editPlan ? 'Edit Plan' : 'Create Data Plan'}</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Network', 'network', 'select', ['mtn', 'airtel', 'glo', '9mobile']],
                ['Data Type', 'dataType', 'select', ['sme', 'corporate', 'gifting', 'direct']],
                ['Plan ID', 'planId', 'text'],
                ['Plan Name', 'name', 'text'],
                ['Data Size', 'dataSize', 'text'],
                ['Validity', 'validity', 'text'],
                ['Cost Price (₦)', 'costPrice', 'number'],
                ['Selling Price (₦)', 'sellingPrice', 'number'],
                ['Agent Price (₦)', 'agentPrice', 'number'],
                ['Provider Code', 'providerPlanCode', 'text'],
              ].map(([label, key, type, options]) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  {type === 'select' ? (
                    <select className="input" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                      {options.map((o) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                    </select>
                  ) : (
                    <input type={type} className="input" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={label} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
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
