import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDateFromBackend } from '../../../../utils/dateHelpers';
import type { Period } from '../../../../types/evaluation'; 

interface PeriodsSectionProps {
  periods: Period[];
  searchTerm: string;
  showInactivePeriods: boolean;
  deletingItems: Set<number>;
  onEdit: (period: Period) => void;
  onDelete: (period: Period) => void;
}

const PeriodsSection: React.FC<PeriodsSectionProps> = ({
  periods,
  searchTerm,
  showInactivePeriods,
  deletingItems,
  onEdit,
  onDelete,
}) => {
  const filteredPeriods = periods
    .filter(p => (showInactivePeriods ? true : p.is_active))
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-3">
      {filteredPeriods.length === 0 ? (
        <p className="text-gray-500 text-center">
          {showInactivePeriods
            ? 'No hay períodos disponibles'
            : 'No hay períodos activos disponibles'}
        </p>
      ) : (
        filteredPeriods.map(period => {
          const isDeleting = deletingItems.has(period.id);
          return (
            <div
              key={period.id}
              className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold text-gray-900">
                  {period.name}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      period.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {period.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </h4>
                <p className="text-sm text-gray-600">{period.description}</p>
                <p className="text-sm text-gray-600">
                  {formatDateFromBackend(period.start_date)} -{' '}
                  {formatDateFromBackend(period.end_date)}
                </p>
                <p className="text-sm text-gray-500">
                  Fecha límite: {formatDateFromBackend(period.due_date)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(period)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Editar período"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => onDelete(period)}
                  disabled={isDeleting}
                  className="p-2 hover:bg-red-50 rounded-lg"
                  title="Desactivar período"
                >
                  <Trash2
                    className={`w-4 h-4 ${isDeleting ? 'text-gray-400' : 'text-red-500'}`}
                  />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PeriodsSection;