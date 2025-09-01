import React, { useState, useEffect } from 'react';
import { FileCheck, X, Target, Percent, Loader2 } from 'lucide-react';
import { getTemplateById } from '../services/evaluationService';
import type { TemplateListItem, TemplateDetail, Criteria, TemplateCriteriaItem } from '../types/evaluation';

interface VerPlantillaModalProps {
  show: boolean;
  onClose: () => void;
  template: TemplateListItem | null;
  criteria: Criteria[];
}

const VerPlantillaModal: React.FC<VerPlantillaModalProps> = ({
  show,
  onClose,
  template: initialTemplate,
  criteria,
}) => {
  const [templateDetail, setTemplateDetail] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && initialTemplate?.id) {
      loadTemplateDetails();
    } else if (!show) {
      setTemplateDetail(null);
      setError(null);
    }
  }, [show, initialTemplate?.id]);

  const loadTemplateDetails = async () => {
    if (!initialTemplate?.id) return;

    setLoading(true);
    setError(null);

    try {
      const fullTemplate = await getTemplateById(initialTemplate.id);
      setTemplateDetail(fullTemplate);
    } catch (err) {
      console.error('Error loading template details:', err);
      setError('Error al cargar los detalles de la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'productividad':
        return 'Productividad';
      case 'conducta_laboral':
        return 'Conducta Laboral';
      case 'habilidades':
        return 'Habilidades';
      default:
        return category;
    }
  };

  const getCriteriaInfo = (criteriaId: number) => {
    return criteria.find(c => c.id === criteriaId);
  };

  if (!show || !initialTemplate) return null;

  const totalCriteria = templateDetail
    ? (templateDetail.criteria.productivity?.length || 0) +
      (templateDetail.criteria.work_conduct?.length || 0) +
      (templateDetail.criteria.skills?.length || 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileCheck className="text-purple-600" size={24} />
              Detalles de Plantilla
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-purple-600" size={32} />
              <span className="ml-3 text-gray-600">Cargando detalles...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Nombre</h4>
                  <p className="text-gray-900 font-medium">
                    {templateDetail?.name || initialTemplate.name}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción</h4>
                  <p className="text-gray-600">
                    {templateDetail?.description || initialTemplate.description || 'Sin descripción'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Estado</h4>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        (templateDetail?.is_active ?? initialTemplate.is_active)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {(templateDetail?.is_active ?? initialTemplate.is_active) ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Total de Criterios</h4>
                    <span className="text-gray-900 font-medium">
                      {totalCriteria || initialTemplate.criteria_count || 0}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Categorías Usadas</h4>
                    <span className="text-gray-900 font-medium">
                      {initialTemplate.categories_used || 0}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Target size={20} className="text-purple-600" />
                  Criterios de Evaluación
                </h4>
                {!templateDetail || totalCriteria === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      {loading ? 'Cargando criterios...' : 'No hay criterios asignados a esta plantilla'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templateDetail.criteria.productivity?.length > 0 && (
                      <CategorySection
                        title="Productividad"
                        criteria={templateDetail.criteria.productivity}
                        getCriteriaInfo={getCriteriaInfo}
                      />
                    )}
                    {templateDetail.criteria.work_conduct?.length > 0 && (
                      <CategorySection
                        title="Conducta Laboral"
                        criteria={templateDetail.criteria.work_conduct}
                        getCriteriaInfo={getCriteriaInfo}
                      />
                    )}
                    {templateDetail.criteria.skills?.length > 0 && (
                      <CategorySection
                        title="Habilidades"
                        criteria={templateDetail.criteria.skills}
                        getCriteriaInfo={getCriteriaInfo}
                      />
                    )}
                  </div>
                )}
              </div>
              {templateDetail && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Creado:</span>
                      <span className="ml-2 text-gray-700">
                        {templateDetail.created_at
                          ? new Date(templateDetail.created_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Actualizado:</span>
                      <span className="ml-2 text-gray-700">
                        {templateDetail.updated_at
                          ? new Date(templateDetail.updated_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategorySection: React.FC<{
  title: string;
  criteria: TemplateCriteriaItem[];
  getCriteriaInfo: (id: number) => Criteria | undefined;
}> = ({ title, criteria, getCriteriaInfo }) => {
  const categoryTotal = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  const isValid = Math.abs(categoryTotal - 100) < 0.01;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h5 className="font-medium text-gray-700">{title}</h5>
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              isValid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            Total: {categoryTotal.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {criteria.map((criteriaItem, idx) => {
          const info = getCriteriaInfo(criteriaItem.CriteriaId);
          return (
            <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">
                    {info?.name || criteriaItem.criteria?.name || `Criterio ID: ${criteriaItem.CriteriaId}`}
                  </p>
                  {(info?.description || criteriaItem.criteria?.description) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {info?.description || criteriaItem.criteria?.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-700">{criteriaItem.weight.toFixed(2)}%</span>
                  <Percent size={14} className="text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerPlantillaModal;