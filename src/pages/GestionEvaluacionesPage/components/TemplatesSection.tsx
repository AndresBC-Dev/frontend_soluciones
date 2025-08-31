import React from 'react';
import { Eye, Copy, Play, Trash2 } from 'lucide-react';
import type { Template } from '../../../types/evaluation';

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
  onDelete,
}) => {
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {filteredTemplates.length === 0 ? (
        <p className="text-gray-500 text-center">No hay plantillas disponibles</p>
      ) : (
        filteredTemplates.map(template => {
          const isDeleting = deletingItems.has(template.id);
          const isCloning = cloningItems.has(template.id);
          return (
            <div
              key={template.id}
              className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h4 className="font-semibold">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
                <p className="text-sm text-gray-600">
                  Estado: {template.is_active ? 'Activa' : 'Inactiva'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onView(template)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Eye className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => onClone(template)}
                  disabled={isCloning}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Copy className={`w-4 h-4 ${isCloning ? 'text-gray-400' : 'text-green-500'}`} />
                </button>
                <button
                  onClick={() => onGenerateEval(template)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Play className="w-4 h-4 text-purple-500" />
                </button>
                <button
                  onClick={() => onDelete(template)}
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

export default TemplatesSection;