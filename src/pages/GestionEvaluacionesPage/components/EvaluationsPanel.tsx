import React, { useState, useMemo } from 'react';
import { Plus, Eye, FileDown, Trash2, CheckCircle, Clock, AlertTriangle, Loader2, Search } from 'lucide-react';
import type { Evaluation, TemplateListItem } from '../../../../src/types/evaluation';

interface EvaluationsPanelProps {
  evaluations: Evaluation[];
  templates: TemplateListItem[];
  deletingItems: Set<number>;
  onCreateEvaluation: () => void;
  onViewEvaluation: (evaluation: Evaluation) => void;
  onPerformEvaluation: (evaluation: Evaluation) => void;
  onDeleteEvaluation: (evaluation: Evaluation) => void;
  onExportEvaluation: (evaluation: Evaluation) => void;
}

const EvaluationsPanel: React.FC<EvaluationsPanelProps> = ({
  evaluations,
  templates,
  deletingItems,
  onCreateEvaluation,
  onViewEvaluation,
  onPerformEvaluation,
  onDeleteEvaluation,
  onExportEvaluation,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvaluations = useMemo(() => {
    let filtered = evaluations;

    // Filtrar por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(e => {
        const templateName = templates.find(t => t.id === e.template_id)?.name || '';
        return (
          e.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.period_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          templateName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Ordenar de más reciente a más antiguo
    });
  }, [evaluations, templates, statusFilter, searchTerm]);

  const getStatusIconAndColor = (status: Evaluation['status']) => {
    switch (status) {
      case 'completed':
        return { Icon: CheckCircle, color: 'text-green-600', label: 'Completada' };
      case 'overdue':
        return { Icon: AlertTriangle, color: 'text-red-600', label: 'Vencida' };
      case 'in_progress':
        return { Icon: Clock, color: 'text-blue-600', label: 'En progreso' };
      case 'pending':
        return { Icon: Clock, color: 'text-yellow-600', label: 'Pendiente' };
      default:
        return { Icon: Clock, color: 'text-gray-600', label: status };
    }
  };

  const calculateTotalScore = (criteria: Evaluation['criteria']) => {
    if (!criteria || criteria.every(c => !c.score)) return null;
    const total = criteria.reduce((sum, c) => sum + (c.score || 0) * (c.weight / 100), 0);
    return total.toFixed(2);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Evaluaciones</h2>
        <button
          onClick={onCreateEvaluation}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear Evaluación
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar evaluaciones por empleado, período o plantilla..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todas las evaluaciones</option>
          <option value="pending">Pendientes</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completadas</option>
          <option value="overdue">Vencidas</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              {searchTerm || statusFilter !== 'todos'
                ? 'No se encontraron evaluaciones con los filtros aplicados.'
                : 'No hay evaluaciones disponibles. Crea una nueva evaluación.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvaluations.map(evaluation => {
              const { Icon, color, label } = getStatusIconAndColor(evaluation.status);
              const isDeleting = deletingItems.has(evaluation.id);
              const templateName = templates.find(t => t.id === evaluation.template_id)?.name || 'Sin plantilla';
              const totalScore = calculateTotalScore(evaluation.criteria);

              return (
                <div
                  key={evaluation.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {evaluation.employee_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Plantilla: {templateName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Período: {evaluation.period_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Evaluador: {evaluation.evaluator_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className={`text-xs font-medium ${color}`}>{label}</span>
                    </div>
                    {totalScore && (
                      <span className="text-xs font-medium text-gray-600">
                        {totalScore}/100
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewEvaluation(evaluation)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        disabled={isDeleting}
                        title="Ver evaluación"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPerformEvaluation(evaluation)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        disabled={isDeleting || evaluation.status === 'completed'}
                        title="Realizar evaluación"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onExportEvaluation(evaluation)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        disabled={isDeleting || evaluation.status !== 'completed'}
                        title="Exportar evaluación"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteEvaluation(evaluation)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        disabled={isDeleting}
                        title="Eliminar evaluación"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationsPanel;