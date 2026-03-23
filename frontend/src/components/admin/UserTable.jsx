import React, { useMemo, useState } from 'react';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import FormInput from '../common/FormInput';

const UserTable = ({
  users,
  loading,
  actionLoadingMap,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !q ||
        String(user.name || '').toLowerCase().includes(q) ||
        String(user.email || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, query, statusFilter]);

  if (loading) {
    return <Loader label="Loading users..." />;
  }

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-100">{row.name}</span>
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
    },
    {
      header: 'Phone',
      accessor: 'phone',
      sortable: true,
      render: (row) => row.phone || 'N/A'
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Created',
      accessor: (row) => row.createdAt || '',
      sortKey: (row) => new Date(row.createdAt || 0).getTime(),
      sortable: true,
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => {
        const blocked = row.status === 'blocked';
        const rowLoading = Boolean(actionLoadingMap[row.id]);

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(row)}
              disabled={rowLoading}
              className="h-8 px-2.5 text-xs"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(row)}
              disabled={rowLoading}
              className="h-8 px-2.5 text-xs"
            >
              {blocked ? 'Unblock' : 'Block'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(row)}
              disabled={rowLoading}
              className="h-8 px-2.5 text-xs"
            >
              Delete
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Total Users: {users.length}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Search, filter, edit, block/unblock, and delete users.</p>
        </div>
        <div className="flex gap-2">
          <FormInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or email..."
            className="min-w-[220px]"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState icon="👥" title="No users found" description="Try changing search or status filters." />
      ) : (
        <DataTable
          data={filteredUsers}
          columns={columns}
          rowKey="id"
          searchPlaceholder="Search users by name, email, or phone"
          emptyTitle="No matching users"
          emptyMessage="Try adjusting filters or search terms."
          mobileCardRender={(row) => {
            const blocked = row.status === 'blocked';
            const rowLoading = Boolean(actionLoadingMap[row.id]);

            return (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{row.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{row.email}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.phone || 'N/A'}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(row)} disabled={rowLoading} className="h-8 px-2.5 text-xs">Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => onToggleStatus(row)} disabled={rowLoading} className="h-8 px-2.5 text-xs">{blocked ? 'Unblock' : 'Block'}</Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(row)} disabled={rowLoading} className="h-8 px-2.5 text-xs">Delete</Button>
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
};

export default UserTable;
