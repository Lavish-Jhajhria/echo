/**
 * KPI card for admin dashboard metrics.
 */

import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string|number} props.value
 * @param {number} [props.change]
 * @param {React.ReactNode} props.icon
 * @param {'up'|'down'|'neutral'} [props.trend]
 * @returns {JSX.Element}
 */
const KPICard = ({ title, value, change, icon, trend = 'neutral' }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-600">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
      {typeof change === 'number' && (
        <div
          className={`flex items-center gap-1 text-sm ${
            trend === 'up'
              ? 'text-emerald-600'
              : trend === 'down'
                ? 'text-red-600'
                : 'text-slate-600'
          }`}
        >
          {trend === 'up' && <TrendingUp className="w-4 h-4" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4" />}
          <span>
            {change > 0 ? '+' : ''}
            {change}%
          </span>
        </div>
      )}
    </div>
  );
};

export default KPICard;

