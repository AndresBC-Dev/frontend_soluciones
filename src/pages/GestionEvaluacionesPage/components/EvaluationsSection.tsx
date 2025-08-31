import React, { useContext } from 'react';
import { Eye, Trash2, Clock, CheckCircle, AlertCircle, Edit, Download } from 'lucide-react';
import type { Evaluation } from '../../../types/evaluation'; 
import { AuthContext } from '../../../context/authContext';
import type { AuthContextType } from '../../../context/authContext';

interface EvaluationsSectionProps {
  evaluations: Evaluation[];
  searchTerm: string;
  deletingItems: Set<number>;
  onViewEvaluation: (evaluation: Evaluation) => void;
  onPerformEvaluation: (evaluation: Evaluation) => void;
  onDeleteEvaluation: (evaluation: Evaluation) => void;
  onExportEvaluation: (evaluation: Evaluation) => void;
}

const EvaluationsSection: React.FC<EvaluationsSectionProps> = ({
  evaluations,
  searchTerm,
  deletingItems,
  onViewEvaluation,
  onPerformEvaluation,
  onDeleteEvaluation,
  onExportEvaluation,
}) => {
  const { user } = useContext(AuthContext) as AuthContextType;

  const filteredEvaluations = evaluations.filter(e =>
    e.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.period_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: Evaluation['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: Evaluation['status']) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En Progreso';
      case 'overdue':
        return 'Vencida';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const isEvaluator = (evaluation: Evaluation) => {
    return user?.id === evaluation.evaluator_id;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Evaluaciones</h2>
      </div>
      
      {filteredEvaluations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron evaluaciones</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEvaluations.map((evaluation) => {
            const isDeleting = deletingItems.has(evaluation.id);
            const canPerform = isEvaluator(evaluation) && evaluation.status !== 'completed';
            return (
              <div
                key={evaluation.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {evaluation.employee_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Período: {evaluation.period_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Evaluador: {evaluation.evaluator_name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(evaluation.status)}
                      <span className="text-sm font-medium">
                        {getStatusLabel(evaluation.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewEvaluation(evaluation)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Ver evaluación"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    {canPerform && (
                      <button
                        onClick={() => onPerformEvaluation(evaluation)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Realizar evaluación"
                      >
                        <Edit className="w-4 h-4 text-purple-600" />
                      </button>
                    )}
                    <button
                      onClick={() => onExportEvaluation(evaluation)}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      title="Exportar evaluación"
                    >
                      <Download className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => onDeleteEvaluation(evaluation)}
                      disabled={isDeleting}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar evaluación"
                    >
                      <Trash2 className={`w-4 h-4 ${isDeleting ? 'text-gray-400' : 'text-red-600'}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EvaluationsSection;