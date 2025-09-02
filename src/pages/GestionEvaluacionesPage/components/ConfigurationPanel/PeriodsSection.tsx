import React from 'react';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import type { Period } from '../../../../types/evaluation';

interface PeriodsSectionProps {
  periods: Period[];
  deletingItems: Set<number>;
  onEdit: (period: Period) => void;
  onDelete: (period: Period) => void;
}

const PeriodsSection: React.FC<PeriodsSectionProps> = ({
  periods,
  deletingItems,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-3">
      {periods.length === 0 ? (
        <p className="text-gray-500 text-center">No hay períodos disponibles</p>
      ) : (
        <div className="max-h-[400px] overflow-y-auto pr-4">
          {periods.map(period => {
            const isDeleting = deletingItems.has(period.id);
            return (
              <div
                key={period.id}
                className={`rounded-lg p-4 flex justify-between items-center transition-all ${
                  !period.is_active 
                    ? 'bg-gray-50 border border-gray-200 opacity-75' 
                    : 'bg-white border border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    {period.name}
                    {!period.is_active && (
                      <span className="ml-2 text-xs text-gray-500 italic">(Inactivo)</span>
                    )}
                  </h4>
                  {period.description && (
                    <p className="text-sm text-gray-600 mt-1">{period.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                  </div>
                  {period.status && (
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                      period.status === 'active' ? 'bg-green-100 text-green-700' :
                      period.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {period.status}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(period)}
                    disabled={!period.can_modify}
                    className={`p-2 rounded-lg ${
                      period.can_modify
                        ? 'hover:bg-gray-100 text-blue-500'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    title={period.can_modify ? 'Editar período' : 'No se puede editar este período'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(period)}
                    disabled={isDeleting || !period.can_delete}
                    className={`p-2 rounded-lg ${
                      isDeleting || !period.can_delete
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-red-50 text-red-500'
                    }`}
                    title={period.can_delete ? 'Desactivar período' : 'No se puede desactivar este período'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PeriodsSection;