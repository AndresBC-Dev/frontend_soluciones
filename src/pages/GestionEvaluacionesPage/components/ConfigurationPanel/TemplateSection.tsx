import React from 'react';
import { FileCheck, Eye, Copy, Play, Trash2, RefreshCw } from 'lucide-react';
import type { Template } from '../../types';

interface TemplatesSectionProps {
  templates: Template[];
  searchTerm: string;
  deletingItems: Set<number>;
  cloningItems: Set<number>;
  onView: (template: Template) => void;
  onClone: (template: Template) => void;
  onGenerateEval: (template: Template) => void;
  onDelete: (template: Template) => void;
}

const TemplatesSection: React.FC<TemplatesSectionProps> = ({
  templates,
  searchTerm,
  deletingItems,
  cloningItems,
  onView,
  onClone,
  onGenerateEval,
  onDelete
}) => {
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (filteredTemplates.length === 0) {
    return (
      <div className="text-center py-8">
        <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay plantillas disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTemplates.map(template => {
        const isDeleting = deletingItems.has(template.id);
        const isCloning = cloningItems.has(template.id);
        const totalWeight = template.criteria?.reduce((sum, c) => sum + c.weight, 0) || 0;

        return (
          <div
            key={template.id}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                {template.description && (
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">
                    {template.criteria?.length || 0} criterios
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    totalWeight === 100 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {totalWeight}% total
                  </span>
                  {template.position && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {template.position}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onView(template)}
                  className="p-2 hover:bg-blue-50 rounded-lg"
                  disabled={isDeleting || isCloning}
                  title="Ver plantilla"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => onClone(template)}
                  className="p-2 hover:bg-orange-50 rounded-lg"
                  disabled={isDeleting || isCloning}
                  title="Clonar plantilla"
                >
                  {isCloning ? (
                    <RefreshCw className="w-4 h-4 text-orange-600 animate-spin" />
                  ) : (
                    <Copy className="w-4 h-4 text-orange-600" />
                  )}
                </button>
                <button
                  onClick={() => onGenerateEval(template)}
                  className="p-2 hover:bg-green-50 rounded-lg"
                  disabled={isDeleting || isCloning}
                  title="Generar evaluación"
                >
                  <Play className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => onDelete(template)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                  disabled={isDeleting || isCloning}
                  title="Eliminar plantilla"
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

export default TemplatesSection;