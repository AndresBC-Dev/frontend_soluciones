import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { Period } from '../../../types/evaluation';

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
  onDelete,
}) => {
  const filteredPeriods = periods.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {filteredPeriods.length === 0 ? (
        <p className="text-gray-500 text-center">No hay períodos disponibles</p>
      ) : (
        filteredPeriods.map(period => {
          const isDeleting = deletingItems.has(period.id);
          return (
            <div
              key={period.id}
              className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold">{period.name}</h4>
                <p className="text-sm text-gray-600">{period.description}</p>
                <p className="text-sm text-gray-600">
                  {period.start_date} - {period.end_date}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(period)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => onDelete(period)}
                  disabled={isDeleting}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className={`w-4 h-4 ${isDeleting ? 'text-gray-400' : 'text-red-500'}`} />
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