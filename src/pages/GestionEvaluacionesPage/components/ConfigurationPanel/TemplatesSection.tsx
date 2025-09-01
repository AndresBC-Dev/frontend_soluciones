import React from 'react';
import { FileText, Eye, Copy, Trash2, Edit } from 'lucide-react';
import type { Template, Criteria, TemplateDetail, TemplateListItem, TemplateCriteriaItem } from '../../../../types/evaluation';

interface TemplatesSectionProps {
  templates: Template[];
  criteria: Criteria[];
  deletingItems: Set<number>;
  cloningItems: Set<number>;
  onView: (template: Template) => void;
  onClone: (template: Template) => void;
  onGenerateEval: (template: Template) => void;
  onDelete: (template: Template) => void;
  onEdit: (template: Template) => void;
}

const isTemplateDetail = (template: Template): template is TemplateDetail => {
  return 'criteria' in template && typeof template.criteria === 'object';
};

const isTemplateListItem = (template: Template): template is TemplateListItem => {
  return 'criteria_count' in template;
};

const TemplatesSection: React.FC<TemplatesSectionProps> = ({
  templates,
  criteria,
  deletingItems,
  cloningItems,
  onView,
  onClone,
  onGenerateEval,
  onDelete,
  onEdit,
}) => {
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

  return (
    <div className="space-y-3">
      {templates.length === 0 ? (
        <p className="text-gray-500 text-center">No hay plantillas disponibles</p>
      ) : (
        templates.map(template => {
          const isDeleting = deletingItems.has(template.id);
          const isCloning = cloningItems.has(template.id);

          let allCriteria: TemplateCriteriaItem[] = [];
          if (isTemplateDetail(template)) {
            allCriteria = [
              ...template.criteria.productivity,
              ...template.criteria.work_conduct,
              ...template.criteria.skills,
            ];
          }

          const templateCriteria = allCriteria
            .map(c => criteria.find(cr => cr.id === c.CriteriaId))
            .filter((c): c is Criteria => c !== undefined);

          const criteriaCount = isTemplateListItem(template) ? template.criteria_count : allCriteria.length;

          return (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    {template.name}
                    <span
                      className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        template.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {template.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </h4>
                  {template.description && (
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  )}
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Criterios: {criteriaCount || 0}</span>
                    {allCriteria.length > 0 ? (
                      <div className="mt-1">
                        {allCriteria.map((c: TemplateCriteriaItem) => {
                          const criterion = criteria.find(cr => cr.id === c.CriteriaId);
                          if (!criterion) return null;
                          return (
                            <span key={c.CriteriaId} className="inline-block mr-2 text-xs">
                              • {criterion.name} ({(c.weight * 100).toFixed(2)}% - {getCategoryLabel(c.category || criterion.category)})
                            </span>
                          );
                        })}
                      </div>
                    ) : criteriaCount > 0 ? (
                      <p className="text-xs text-gray-500 mt-1">
                        {criteriaCount} criterios asignados (detalles no disponibles)
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Sin criterios asignados</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => onView(template)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Ver plantilla"
                  >
                    <Eye className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => onEdit(template)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Editar plantilla"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => onClone(template)}
                    disabled={isCloning}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Clonar plantilla"
                  >
                    <Copy className={`w-4 h-4 ${isCloning ? 'text-gray-400' : 'text-green-500'}`} />
                  </button>
                  <button
                    onClick={() => onGenerateEval(template)}
                    className="p-2 hover:bg-blue-50 rounded-lg"
                    title="Generar evaluación"
                  >
                    <FileText className="w-4 h-4 text-purple-500" />
                  </button>
                  <button
                    onClick={() => onDelete(template)}
                    disabled={isDeleting}
                    className="p-2 hover:bg-red-50 rounded-lg"
                    title="Eliminar plantilla"
                  >
                    <Trash2
                      className={`w-4 h-4 ${isDeleting ? 'text-gray-400' : 'text-red-500'}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TemplatesSection;