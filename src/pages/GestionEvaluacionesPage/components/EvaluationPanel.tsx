import React from 'react';
import { Activity, Plus, Trash2, RefreshCw } from 'lucide-react';
import type { Evaluation } from '../types';

interface EvaluationsPanelProps {
  evaluations: Evaluation[];
  deletingItems: Set<number>;
  onCreateEvaluation: () => void;
  onViewEvaluation: (evaluation: Evaluation) => void;
  onDeleteEvaluation: (evaluation: Evaluation) => void;
}

const EvaluationsPanel: React.FC<EvaluationsPanelProps> = ({
  evaluations,
  deletingItems,
  onCreateEvaluation,
  onViewEvaluation,
  onDeleteEvaluation
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencida';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Evaluaciones</h2>
        <button
          onClick={onCreateEvaluation}
          className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {evaluations.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No hay evaluaciones creadas</p>
            <p className="text-gray-400 text-sm mt-2">
              Crea una nueva evaluación desde una plantilla
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map(evaluation => {
              const isDeleting = deletingItems.has(evaluation.id);
              return (
                <div
                  key={evaluation.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all cursor-pointer"
                  onClick={() => onViewEvaluation(evaluation)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {evaluation.employee_name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Evaluador: {evaluation.evaluator_name}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(evaluation.status)}`}>
                          {getStatusText(evaluation.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {evaluation.period_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvaluation(evaluation);
                        }}
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
        )}
      </div>
    </div>
  );
};

export default EvaluationsPanel;