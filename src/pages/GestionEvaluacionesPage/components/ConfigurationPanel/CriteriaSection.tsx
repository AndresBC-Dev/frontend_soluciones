import React from 'react';
import { Edit, Trash2, RotateCcw } from 'lucide-react';
import type { Criteria } from '../../../../types/evaluation';

interface CriteriaSectionProps {
  criteria: Criteria[];
  searchTerm: string;
  selectedCategory: string;
  showInactiveCriteria: boolean;
  deletingItems: Set<number>;
  onEdit: (criteria: Criteria) => void;
  onDelete: (criteria: Criteria) => void;
  onReactivate: (criteria: Criteria) => void;
  onToggleShowInactive?: () => void;
}

const CriteriaSection: React.FC<CriteriaSectionProps> = ({
  criteria,
  searchTerm,
  selectedCategory,
  showInactiveCriteria,
  deletingItems,
  onEdit,
  onDelete,
  onReactivate,
  onToggleShowInactive,
}) => {
  const filteredCriteria = criteria
    .filter(c => showInactiveCriteria || c.is_active)
    .filter(c => selectedCategory === 'todos' || c.category === selectedCategory)
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const inactiveCriteriaCount = criteria.filter(c => !c.is_active).length;

  return (
    <div className="space-y-3">
      {onToggleShowInactive && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            {inactiveCriteriaCount > 0
              ? `${inactiveCriteriaCount} criterio(s) inactivo(s) disponibles`
              : 'No hay criterios inactivos'}
          </p>
          <button
            onClick={onToggleShowInactive}
            className="text-sm text-blue-500 hover:underline"
          >
            {showInactiveCriteria
              ? 'Ocultar criterios inactivos'
              : 'Mostrar criterios inactivos'}
          </button>
        </div>
      )}
      {filteredCriteria.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {criteria.length === 0
              ? 'No hay criterios disponibles en el sistema'
              : showInactiveCriteria
                ? searchTerm
                  ? `No hay criterios que coincidan con "${searchTerm}"`
                  : selectedCategory !== 'todos'
                    ? `No hay criterios en la categoría "${selectedCategory}"`
                    : 'No hay criterios disponibles'
                : searchTerm
                  ? `No hay criterios activos que coincidan con "${searchTerm}"`
                  : selectedCategory !== 'todos'
                    ? `No hay criterios activos en la categoría "${selectedCategory}"`
                    : 'No hay criterios activos disponibles'}
          </p>
          {criteria.length > 0 && !showInactiveCriteria && (
            <p className="text-sm text-gray-400 mt-1">
              Hay {inactiveCriteriaCount} criterio(s) inactivo(s). Activa "Mostrar criterios inactivos" para verlos.
            </p>
          )}
        </div>
      ) : (
        filteredCriteria.map(criterion => {
          const isDeleting = deletingItems.has(criterion.id);
          return (
            <div
              key={criterion.id}
              className={`rounded-lg p-4 flex justify-between items-center ${
                criterion.is_active ? 'bg-green-50' : 'bg-gray-200'
              }`}
            >
              <div>
                <h4 className="font-semibold text-gray-900">
                  {criterion.name}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      criterion.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {criterion.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </h4>
                <p className="text-sm text-gray-600">{criterion.description}</p>
                <p className="text-sm text-gray-600">
                  Categoría: {criterion.category}
                </p>
                <p className="text-sm text-gray-500">Peso: {criterion.weight * 100}%</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(criterion)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-blue-500"
                  title="Editar criterio"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {criterion.is_active ? (
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