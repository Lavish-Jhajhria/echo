/**
 * Collapsible admin sidebar navigation.
 */

import React from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, MessageSquare, Users, Flag } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, to: '/admin' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, to: '/admin/feedback' },
  { id: 'users', label: 'Users', icon: Users, to: '/admin/users' },
  { id: 'reports', label: 'Reports', icon: Flag, to: '/admin/reports' }
];

/**
 * Sidebar component.
 * @param {Object} props
 * @param {boolean} props.collapsed
 * @param {Function} props.onToggle
 * @returns {JSX.Element}
 */
const Sidebar = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={`h-screen bg-white border-r border-slate-200 flex flex-col transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 px-3 flex items-center gap-3 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
          E
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">Echo Admin</div>
            <div className="text-[11px] text-slate-500">Feedback dashboard</div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-slate-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

