import React from 'react';
import { Target, Edit, Trash2, RotateCcw } from 'lucide-react';
import type { Criteria } from '../../../../types/evaluation';

interface CriteriaSectionProps {
  criteria: Criteria[];
  deletingItems: Set<number>;
  onEdit: (criteria: Criteria) => void;
  onDelete: (criteria: Criteria) => void;
  onReactivate: (criteria: Criteria) => void;
}

const CriteriaSection: React.FC<CriteriaSectionProps> = ({
  criteria,
  deletingItems,
  onEdit,
  onDelete,
  onReactivate,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity':
        return 'bg-blue-100 text-blue-700';
      case 'work_conduct':
        return 'bg-green-100 text-green-700';
      case 'skills':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'productivity':
        return 'Productividad';
      case 'work_conduct':
        return 'Conducta Laboral';
      case 'skills':
        return 'Habilidades';
      default:
        return category;
    }
  };

  return (
    <div className="space-y-3">
      {criteria.length === 0 ? (
        <p className="text-gray-500 text-center">No hay criterios disponibles</p>
      ) : (
        criteria.map(criterion => {
          const isDeleting = deletingItems.has(criterion.id);
          return (
            <div
              key={criterion.id}
              className={`rounded-lg p-4 flex justify-between items-center ${
                criterion.is_active === false
                  ? 'bg-gray-50 border border-gray-200 opacity-75'
                  : 'bg-white border border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  {criterion.name}
                  {criterion.is_active === false && (
                    <span className="ml-2 text-xs text-gray-500 italic">(Inactivo)</span>
                  )}
                </h4>
                {criterion.description && (
                  <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(criterion.category)}`}>
                    {getCategoryLabel(criterion.category)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Peso: {(criterion.weight * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(criterion)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-blue-500"
                  title="Editar criterio"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {criterion.is_active !== false ? (
                  <button
                    onClick={() => onDelete(criterion)}
                    disabled={isDeleting || !(criterion.can_delete ?? true)}
                    className={`p-2 rounded-lg ${
                      isDeleting || !(criterion.can_delete ?? true)
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-red-50 text-red-500'
                    }`}
                    title={
                      criterion.can_delete ?? true
                        ? 'Desactivar criterio'
                        : 'No se puede desactivar este criterio porque está en uso'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => onReactivate(criterion)}
                    disabled={isDeleting}
                    className={`p-2 rounded-lg ${
                      isDeleting ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-green-50 text-green-500'
                    }`}
                    title="Reactivar criterio"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CriteriaSection;