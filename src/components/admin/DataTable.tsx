import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, MoreVertical } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (search: string) => void;
  onFilter?: (filters: any) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: (row: any) => React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  onSearch,
  onFilter,
  searchPlaceholder = "Rechercher...",
  filters,
  actions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const renderMobileCard = (row: any, index: number) => (
    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {columns.slice(0, 2).map((column) => (
            <div key={column.key} className="mb-1">
              {column.render ? column.render(row[column.key], row) : row[column.key]}
            </div>
          ))}
        </div>
        {actions && (
          <div className="ml-2">
            {actions(row)}
          </div>
        )}
      </div>
      {columns.length > 2 && (
        <div className="space-y-1 text-sm text-gray-600">
          {columns.slice(2).map((column) => (
            <div key={column.key} className="flex justify-between">
              <span className="font-medium">{column.label}:</span>
              <span>{column.render ? column.render(row[column.key], row) : row[column.key]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header avec recherche et filtres */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          {filters && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </button>
            </div>
          )}
        </div>
        {showFilters && filters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            {filters}
          </div>
        )}
      </div>

      {/* Contenu du tableau */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Chargement...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucune donnée disponible</p>
          </div>
        ) : (
          <>
            {/* Vue desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                      >
                        {column.label}
                      </th>
                    ))}
                    {actions && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}>
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {actions(row)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vue mobile */}
            <div className="md:hidden p-4">
              {data.map((row, index) => renderMobileCard(row, index))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 sm:px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} résultats
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 text-sm">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};