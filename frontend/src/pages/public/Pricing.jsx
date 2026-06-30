import { useQuery } from '@tanstack/react-query';
import { dataAPI } from '../../api';
import { Wifi, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const networks = ['mtn', 'airtel', 'glo', '9mobile'];
const dataTypes = ['sme', 'corporate', 'gifting', 'direct'];

export default function Pricing() {
  const [selectedNetwork, setSelectedNetwork] = React.useState('mtn');
  const [selectedType, setSelectedType] = React.useState('sme');

  const { data, isLoading } = useQuery({
    queryKey: ['data-plans', selectedNetwork, selectedType],
    queryFn: () => dataAPI.getPlans({ network: selectedNetwork, dataType: selectedType }),
    select: (res) => res.data.plans,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-dark-50 mb-4">
          Nigeria's <span className="gradient-text">Cheapest</span> VTU Rates
        </h1>
        <p className="text-dark-400 text-lg max-w-xl mx-auto">
          Transparent pricing. No hidden fees. Always the cheapest rates in Nigeria.
        </p>
      </div>

      {/* Network Selector */}
      <div className="flex gap-3 justify-center flex-wrap mb-6">
        {networks.map((n) => (
          <button
            key={n}
            onClick={() => setSelectedNetwork(n)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wide transition-all ${
              selectedNetwork === n
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            {n === '9mobile' ? '9Mobile' : n}
          </button>
        ))}
      </div>

      {/* Type Selector */}
      <div className="flex gap-2 justify-center flex-wrap mb-10">
        {dataTypes.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              selectedType === t ? 'bg-success-500/20 text-success-500 border border-success-500/30' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-dark-700 rounded mb-3 w-3/4" />
              <div className="h-8 bg-dark-700 rounded mb-2" />
              <div className="h-3 bg-dark-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((plan) => (
            <div key={plan._id} className="card-hover p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">{plan.network.toUpperCase()}</p>
                  <p className="font-bold text-dark-100">{plan.name}</p>
                </div>
                <span className="badge-info text-xs">{plan.dataSize}</span>
              </div>
              <div className="mt-auto">
                <p className="text-3xl font-black text-dark-50 mb-1">₦{plan.sellingPrice.toLocaleString()}</p>
                {plan.validity && <p className="text-xs text-dark-400">Valid for {plan.validity}</p>}
                <Link to="/register" className="btn-primary w-full mt-4 text-sm py-2.5">Buy Now</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-dark-400">
          <Wifi size={48} className="mx-auto mb-4 opacity-30" />
          <p>No plans available for selected filters.</p>
        </div>
      )}

      {/* Other Pricing */}
      <div className="mt-24 grid md:grid-cols-3 gap-8">
        {[
          { title: 'Airtime', items: ['MTN: Face value', 'Airtel: Face value', 'Glo: Face value', '9mobile: Face value'] },
          { title: 'Electricity', items: ['IKEDC, EKEDC, AEDC', 'KEDCO, JED, PHED', 'Min ₦500 per purchase', 'Token delivered instantly'] },
          { title: 'Cable TV', items: ['All DStv packages', 'All GOtv packages', 'All Startimes packages', 'Same-day activation'] },
        ].map((sec) => (
          <div key={sec.title} className="card p-6">
            <h3 className="text-lg font-bold text-dark-100 mb-4">{sec.title}</h3>
            <ul className="space-y-2.5">
              {sec.items.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-dark-300">
                  <CheckCircle size={14} className="text-success-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
