import React from 'react';
import StatusBadge from '../common/StatusBadge';

const UserRow = ({ user, loading = false, onEdit, onDelete, onToggleStatus }) => {
  const blocked = user.status === 'blocked';

  return (
    <tr className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
      <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
      <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{user.email}</td>
      <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{user.phone || 'N/A'}</td>
      <td className="p-3"><StatusBadge status={user.status} /></td>
      <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
      <td className="p-3">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(user)}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(user)}
            disabled={loading}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 ${
              blocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-800'
            }`}
          >
            {blocked ? 'Unblock' : 'Block'}
          </button>
          <button
            onClick={() => onDelete(user)}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
