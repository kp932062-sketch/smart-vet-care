import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import Card from './Card';

const DataTable = ({
  data = [],
  columns = [],
  rowKey = 'id',
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  initialSort = { key: null, direction: 'asc' },
  pageSize = 10,
  mobileCardRender,
  className = '',
  onRowClick,
  emptyTitle = 'No records found',
  emptyMessage = 'There is no data to display yet.',
  emptyAction = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize || pageSize);
  const [sortConfig, setSortConfig] = useState(initialSort);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      columns.some((col) => {
        const value =
          typeof col.accessor === 'function'
            ? col.accessor(row)
            : col.accessor
              ? row[col.accessor]
              : '';
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, columns, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal =
        typeof sortConfig.key === 'function'
          ? sortConfig.key(a)
          : a[sortConfig.key] ?? '';
      const bVal =
        typeof sortConfig.key === 'function'
          ? sortConfig.key(b)
          : b[sortConfig.key] ?? '';

      const aComparable = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
      const bComparable = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;

      if (aComparable < bComparable) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aComparable > bComparable) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const resetToFirstPage = () => setCurrentPage(1);

  if (loading) {
    return (
      <div className={className}>
        <Skeleton.Table rows={6} columns={Math.max(columns.length, 4)} />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {searchable && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            placeholder={searchPlaceholder}
            className="w-full sm:max-w-xs"
            onSearch={(value) => {
              setSearchTerm(value.trim());
              resetToFirstPage();
            }}
          />

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing {sortedData.length} result{sortedData.length === 1 ? '' : 's'}
          </div>
        </div>
      )}

      {paginatedData.length === 0 ? (
        <EmptyState
          icon="🗂"
          title={emptyTitle}
          description={emptyMessage}
          action={emptyAction}
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 md:block">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100/90 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300">
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      onClick={() => col.sortable && handleSort(col.sortKey || col.accessor)}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        col.sortable ? 'cursor-pointer select-none hover:bg-slate-200/70 dark:hover:bg-slate-700/70' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.header}
                        {col.sortable && sortConfig.key === (col.sortKey || col.accessor) && (
                          sortConfig.direction === 'asc' ?
                            <ChevronUp className="h-4 w-4" /> :
                            <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/80">
                {paginatedData.map((row, rowIdx) => (
                  <tr
                    key={row[rowKey] || rowIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map((col, colIdx) => {
                      const value = typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                          ? row[col.accessor]
                          : '';

                      return (
                        <td key={colIdx} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                          {col.render ? col.render(row, value) : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {paginatedData.map((row, rowIdx) => (
              <Card
                key={row[rowKey] || rowIdx}
                interactive={Boolean(onRowClick)}
                className={`${onRowClick ? 'cursor-pointer' : ''} p-4`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {mobileCardRender ? (
                  mobileCardRender(row)
                ) : (
                  <div className="space-y-2">
                    {columns.slice(0, 4).map((col, colIdx) => {
                      const value = typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                          ? row[col.accessor]
                          : '';

                      return (
                        <div key={colIdx} className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{col.header}</span>
                          <span className="text-sm text-slate-700 dark:text-slate-200">{col.render ? col.render(row, value) : value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={sortedData.length}
            itemsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setRowsPerPage(pageSizeOptions.includes(value) ? value : rowsPerPage);
              resetToFirstPage();
            }}
          />
        </>
      )}
    </div>
  );
};

export default DataTable;
