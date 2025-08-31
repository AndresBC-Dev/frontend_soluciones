import React from 'react';
import { Target, Edit, Trash2, RefreshCw } from 'lucide-react';
import type { Criteria } from '../../types';

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
  onDelete
}) => {
  const filteredCriteria = criteria.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (filteredCriteria.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay criterios disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredCriteria.map(criteria => {
        const isDeleting = deletingItems.has(criteria.id);
        return (
          <div
            key={criteria.id}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{criteria.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{criteria.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {criteria.category}
                  </span>
                  <span className="text-xs text-gray-500">Peso: {criteria.weight}%</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(criteria)}
                  className="p-2 hover:bg-blue-50 rounded-lg"
                  disabled={isDeleting}
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => onDelete(criteria)}
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

export default CriteriaSection;