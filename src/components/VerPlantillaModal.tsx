import React from 'react';
import { FileCheck, X } from 'lucide-react';
import type { Template, Criteria } from '../types/evaluation';

interface VerPlantillaModalProps {
  show: boolean;
  onClose: () => void;
  template: Template | null;
  criteria: Criteria[];
}

const VerPlantillaModal: React.FC<VerPlantillaModalProps> = ({ show, onClose, template, criteria }) => {
  if (!show || !template) return null;

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

  const getCriteriaById = (id: number) => {
    return criteria.find(c => c.id === id);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-purple-500" />
            {template.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Descripción</h4>
            <p className="text-gray-600 text-sm">
              {template.description || 'Sin descripción'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Estado</h4>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                template.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {template.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Criterios</h4>
            {template.criteria.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay criterios asignados</p>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                {template.criteria.map((c, idx) => {
                  const criterion = getCriteriaById(c.criteriaId);
                  if (!criterion) return null;
                  return (
                    <div key={idx} className="p-2 mb-2 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{criterion.name}</p>
                      <p className="text-xs text-gray-500">
                        {getCategoryLabel(c.category)} - {(c.weight * 100).toFixed(0)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerPlantillaModal;