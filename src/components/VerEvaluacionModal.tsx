import React, { useState, useEffect, useContext } from 'react';
import { X, Loader2, Save, Download, FileCheck, Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/authContext';
import type { Evaluation, CriteriaScore } from '../types/evaluation';
import { submitEvaluationScores } from '../services/evaluationService';
import jsPDF from 'jspdf';

interface VerEvaluacionModalProps {
  show: boolean;
  evaluation: Evaluation | null;
  onClose: () => void;
  onUpdated: (updatedEvaluation: Evaluation) => void;
  onExport: (evaluation: Evaluation) => void;
}

interface EvaluationForm {
  scores: { criteriaId: number; score: number }[];
}

const VerEvaluacionModal: React.FC<VerEvaluacionModalProps> = ({
  show,
  evaluation,
  onClose,
  onUpdated,
  onExport,
}) => {
  const authContext = useContext(AuthContext);
  const [form, setForm] = useState<EvaluationForm>({ scores: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && evaluation) {
      setForm({
        scores: evaluation.criteria.map(c => ({
          criteriaId: c.criteriaId,
          score: c.score !== undefined ? c.score : 0,
        })),
      });
      setError(null);
    }
  }, [show, evaluation]);

  const handleScoreChange = (criteriaId: number, score: number) => {
    setForm(prev => ({
      ...prev,
      scores: prev.scores.map(s =>
        s.criteriaId === criteriaId ? { ...s, score } : s
      ),
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!evaluation) return;

    const invalidScore = form.scores.some(s => s.score < 0 || s.score > 100);
    if (invalidScore) {
      setError('Las puntuaciones deben estar entre 0 y 100');
      return;
    }

    try {
      setLoading(true);
      const updatedEvaluation = await submitEvaluationScores(evaluation.id, {
        scores: form.scores.map(s => ({
          criteria_id: s.criteriaId,
          score: s.score,
        })),
        status: 'completed',
      });
      onUpdated(updatedEvaluation);
    } catch (err: any) {
      let errorMessage = 'Error al guardar la evaluación. Por favor, intenta de nuevo.';
      if (typeof err.message === 'string') {
        const match = err.message.match(/HTTP \d+:\s*(.*)/);
        if (match && match[1]) {
          try {
            const responseJson = JSON.parse(match[1]);
            if (responseJson.error) {
              errorMessage = responseJson.error;
            }
          } catch (parseErr) {
            // No hacer nada si no se puede parsear
          }
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!evaluation) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Evaluación: ${evaluation.employee_name}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Período: ${evaluation.period_name}`, 20, 30);
    doc.text(`Evaluador: ${evaluation.evaluator_name}`, 20, 40);
    doc.text(`Estado: ${getStatusLabel(evaluation.status)}`, 20, 50);

    let y = 70;
    doc.setFontSize(14);
    doc.text('Criterios:', 20, y);
    y += 10;

    evaluation.criteria.forEach((c, index) => {
      doc.setFontSize(10);
      doc.text(
        `${index + 1}. ${c.description} (${c.category})`,
        20,
        y
      );
      doc.text(`Peso: ${(c.weight * 100).toFixed(0)}%`, 140, y);
      doc.text(`Puntuación: ${c.score !== undefined ? c.score : 'N/A'}`, 170, y);
      y += 10;
    });

    doc.save(`evaluacion_${evaluation.id}_${evaluation.employee_name}.pdf`);
    onExport(evaluation);
  };

  const handleClose = () => {
    if (loading) return;
    setForm({ scores: [] });
    setError(null);
    onClose();
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

  if (!show || !evaluation) return null;

  const isEvaluator = authContext?.user?.id === evaluation.evaluator_id;
  const canEdit = isEvaluator && evaluation.status !== 'completed';

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-purple-500" />
            Evaluación: {evaluation.employee_name}
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluado
              </label>
              <p className="text-gray-900">{evaluation.employee_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluador
              </label>
              <p className="text-gray-900">{evaluation.evaluator_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <p className="text-gray-900">{evaluation.period_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <p className="text-gray-900 flex items-center gap-2">
                {getStatusIcon(evaluation.status)}
                {getStatusLabel(evaluation.status)}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Criterios de Evaluación
            </h4>

            <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              {evaluation.criteria.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay criterios asignados</p>
              ) : (
                evaluation.criteria.map(c => (
                  <div key={c.criteriaId} className="p-3 bg-gray-50 rounded-lg mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{c.description}</p>
                        <p className="text-xs text-gray-500">{c.category}</p>
                        <p className="text-xs text-purple-600">
                          Peso: {(c.weight * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Puntuación:</label>
                      {canEdit ? (
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={form.scores.find(s => s.criteriaId === c.criteriaId)?.score || 0}
                          onChange={(e) => handleScoreChange(c.criteriaId, parseInt(e.target.value) || 0)}
                          className="flex-1 text-sm p-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                          placeholder="0"
                          disabled={loading}
                        />
                      ) : (
                        <p className="text-sm text-gray-900">
                          {c.score !== undefined ? c.score : 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Vista previa:</h4>
            <div>
              <p className="font-medium text-purple-900">{evaluation.employee_name}</p>
              <p className="text-sm text-purple-700 mb-2">Período: {evaluation.period_name}</p>
              <p className="text-sm text-purple-700">
                {evaluation.criteria.length} criterios configurados
              </p>
              <p className="text-xs text-purple-600">
                Pesos: {evaluation.criteria.map(c => `${(c.weight * 100).toFixed(0)}% (${c.category})`).join(', ')}
              </p>
              {evaluation.status === 'completed' && (
                <p className="text-xs text-purple-600">
                  Puntuaciones: {evaluation.criteria.map(c => `${c.score || 'N/A'} (${c.description})`).join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {canEdit && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || form.scores.length === 0}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Evaluación
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

export default VerEvaluacionModal;