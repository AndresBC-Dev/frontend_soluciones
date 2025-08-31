import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { Criteria } from '../../../../types/evaluation';

interface CriteriaSectionProps {
  criteria: Criteria[];
  searchTerm: string;
  selectedCategory: string;
  deletingItems: Set<number>;
  onEdit: (criteria: Criteria) => void;
  onDelete: (criteria: Criteria) => void;
}

const CriteriaSection: React.FC<CriteriaSectionProps> = ({
  criteria,
  searchTerm,
  selectedCategory,
  deletingItems,
  onEdit,
  onDelete,
}) => {
  const filteredCriteria = criteria
    .filter(c => selectedCategory === 'todos' || c.category === selectedCategory)
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-3">
      {filteredCriteria.length === 0 ? (
        <p className="text-gray-500 text-center">No hay criterios disponibles</p>
      ) : (
        filteredCriteria.map(criterion => {
          const isDeleting = deletingItems.has(criterion.id);
          return (
            <div
              key={criterion.id}
              className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold text-gray-900">
                  {criterion.name}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      criterion.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
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
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Editar criterio"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => onDelete(criterion)}
                  disabled={isDeleting}
                  className="p-2 hover:bg-red-50 rounded-lg"
                  title="Eliminar criterio"
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

export default CriteriaSection;