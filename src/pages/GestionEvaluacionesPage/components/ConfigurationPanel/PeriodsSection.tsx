import React from 'react';
import { Calendar, Edit, Trash2, RefreshCw } from 'lucide-react';
import type { Period } from '../../types';

interface PeriodsSectionProps {
  periods: Period[];
  searchTerm: string;
  deletingItems: Set<number>;
  onEdit: (period: Period) => void;
  onDelete: (period: Period) => void;
}

const PeriodsSection: React.FC<PeriodsSectionProps> = ({
  periods,
  searchTerm,
  deletingItems,
  onEdit,
  onDelete
}) => {
  const filteredPeriods = periods.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredPeriods.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay períodos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredPeriods.map(period => {
        const isDeleting = deletingItems.has(period.id);
        return (
          <div
            key={period.id}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{period.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{period.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                  </span>
                  {period.is_active && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Activo
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(period)}
                  className="p-2 hover:bg-blue-50 rounded-lg"
                  disabled={isDeleting}
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => onDelete(period)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PeriodsSection;