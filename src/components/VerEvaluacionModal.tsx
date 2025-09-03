import React, { useState, useEffect, useContext } from 'react';
import { X, Download, User, UserCheck, Calendar, Trophy, Star, AlertCircle, XCircle, Clock, CheckCircle, AlertTriangle, PlayCircle, TrendingUp, Users, Target, Save, Edit } from 'lucide-react';
import { AuthContext } from '../context/authContext';
import type { Evaluation } from '../types/evaluation';
import { submitEvaluationScores, getEvaluationForScoring } from '../services/evaluationService';
import jsPDF from 'jspdf';

interface VerEvaluacionModalProps {
  show: boolean;
  evaluation: Evaluation | null;
  onClose: () => void;
  onUpdated: (updatedEvaluation: Evaluation) => void;
  onExport: (evaluation: Evaluation) => void;
}

// Configuración de categorías
const categoryConfig = {
  productividad: {
    label: "Productividad",
    icon: TrendingUp,
    color: "bg-purple-500 text-white"
  },
  conducta_laboral: {
    label: "Conducta Laboral",
    icon: Users,
    color: "bg-blue-500 text-white"
  },
  habilidades: {
    label: "Habilidades",
    icon: Target,
    color: "bg-green-500 text-white"
  }
};

// Configuración de rendimiento
const performanceConfig = {
  excellent: {
    label: "Excelente",
    icon: Trophy,
    color: "text-green-600",
    bgColor: "bg-green-50",
    range: "90-100"
  },
  good: {
    label: "Bueno",
    icon: Star,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    range: "75-89"
  },
  regular: {
    label: "Regular",
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    range: "60-74"
  },
  "needs-improvement": {
    label: "Necesita Mejorar",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    range: "0-59"
  }
};

// Configuración de estados
const statusConfig = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800",
    emoji: "🟡"
  },
  completed: {
    label: "Completada",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800",
    emoji: "🟢"
  },
  overdue: {
    label: "Vencida",
    icon: AlertTriangle,
    className: "bg-red-100 text-red-800",
    emoji: "🔴"
  },
  "in_progress": {
    label: "En Progreso",
    icon: PlayCircle,
    className: "bg-blue-100 text-blue-800",
    emoji: "🔵"
  }
};

const VerEvaluacionModal: React.FC<VerEvaluacionModalProps> = ({
  show,
  evaluation,
  onClose,
  onUpdated,
  onExport,
}) => {
  const authContext = useContext(AuthContext);
  const [fullEvaluation, setFullEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [scores, setScores] = useState<Record<number, number>>({});

  useEffect(() => {
    if (show && evaluation) {
      loadFullEvaluation();
    } else {
      setFullEvaluation(null);
      setEditMode(false);
      setScores({});
      setError(null);
    }
  }, [show, evaluation]);

  const loadFullEvaluation = async () => {
    if (!evaluation) return;
    
    setLoadingData(true);
    setError(null);
    
    try {
      const data = await getEvaluationForScoring(evaluation.id);
      setFullEvaluation(data);
      
      // Inicializar scores si existen
      const initialScores: Record<number, number> = {};
      data.criteria?.forEach((c: any) => {
        if (c.score !== undefined) {
          initialScores[c.criteriaId] = c.score;
        }
      });
      setScores(initialScores);
    } catch (err) {
      console.error('Error loading evaluation details:', err);
      setError('No se pudieron cargar los detalles de la evaluación');
      // Usar datos básicos si falla la carga completa
      setFullEvaluation(evaluation);
    } finally {
      setLoadingData(false);
    }
  };

  const handleScoreChange = (criteriaId: number, value: number) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: Math.min(100, Math.max(0, value))
    }));
  };

  const handleSaveScores = async () => {
    if (!fullEvaluation) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const scoresToSubmit = fullEvaluation.criteria.map((c: any) => ({
        criteria_id: c.criteriaId,
        score: scores[c.criteriaId] || 0
      }));
      
      await submitEvaluationScores(fullEvaluation.id, {
        scores: scoresToSubmit,
        status: 'completed'
      });
      
      // Actualizar evaluación con nuevos scores
      const updatedEval = {
        ...fullEvaluation,
        status: 'completed',
        criteria: fullEvaluation.criteria.map((c: any) => ({
          ...c,
          score: scores[c.criteriaId] || 0
        }))
      };
      
      setFullEvaluation(updatedEval);
      setEditMode(false);
      onUpdated(updatedEval);
    } catch (err: any) {
      setError('Error al guardar las calificaciones');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!fullEvaluation) return;
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Evaluación de Desempeño`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Empleado: ${fullEvaluation.employee_name}`, 20, 35);
    doc.text(`Evaluador: ${fullEvaluation.evaluator_name}`, 20, 45);
    doc.text(`Período: ${fullEvaluation.period_name}`, 20, 55);
    doc.text(`Estado: ${statusConfig[fullEvaluation.status as keyof typeof statusConfig]?.label}`, 20, 65);
    
    let y = 85;
    doc.setFontSize(14);
    doc.text('Criterios de Evaluación:', 20, y);
    y += 15;
    
    // Agrupar criterios por categoría
    const groupedCriteria = fullEvaluation.criteria?.reduce((acc: any, criterion: any) => {
      const cat = criterion.category || 'productividad';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(criterion);
      return acc;
    }, {}) || {};
    
    Object.entries(groupedCriteria).forEach(([category, criteria]: [string, any]) => {
      doc.setFontSize(12);
      doc.text(categoryConfig[category as keyof typeof categoryConfig]?.label || category, 20, y);
      y += 10;
      
      criteria.forEach((c: any, idx: number) => {
        doc.setFontSize(10);
        doc.text(`${idx + 1}. ${c.description}`, 25, y);
        doc.text(`Peso: ${(c.weight * 100).toFixed(0)}%`, 140, y);
        if (c.score !== undefined) {
          doc.text(`Puntuación: ${c.score}`, 170, y);
        }
        y += 8;
      });
      y += 5;
    });
    
    doc.save(`evaluacion_${fullEvaluation.id}_${fullEvaluation.employee_name}.pdf`);
    onExport(fullEvaluation);
  };

  const calculateFinalScore = () => {
    if (!fullEvaluation?.criteria) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    fullEvaluation.criteria.forEach((c: any) => {
      const score = editMode ? (scores[c.criteriaId] || 0) : (c.score || 0);
      totalWeightedScore += score * c.weight;
      totalWeight += c.weight;
    });
    
    return totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'regular';
    return 'needs-improvement';
  };

  if (!show || !fullEvaluation) return null;

  const isEvaluator = authContext?.user?.id === fullEvaluation.evaluator_id;
  const canEdit = isEvaluator && fullEvaluation.status !== 'completed';
  const isCompleted = fullEvaluation.status === 'completed';
  const finalScore = calculateFinalScore();
  const performanceLevel = getPerformanceLevel(finalScore);

  // Agrupar criterios por categoría
  const groupedCriteria = fullEvaluation.criteria?.reduce((acc: any, criterion: any) => {
    const cat = criterion.category || 'productividad';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(criterion);
    return acc;
  }, {}) || {};

  const StatusIcon = statusConfig[fullEvaluation.status as keyof typeof statusConfig]?.icon || Clock;
  const PerformanceIcon = performanceConfig[performanceLevel]?.icon || Star;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Evaluación de Desempeño</h2>
            <p className="text-gray-600 text-sm mt-1">Visualización detallada de la evaluación</p>
          </div>
          <div className="flex gap-2">
            {canEdit && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Calificar
              </button>
            )}
            {(isCompleted || editMode) && (
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            )}
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando detalles...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Información General */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Empleado</div>
                    <div className="font-medium text-gray-900">{fullEvaluation.employee_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Evaluador
                    </div>
                    <div className="font-medium text-gray-900">{fullEvaluation.evaluator_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Período
                    </div>
                    <div className="font-medium text-gray-900">{fullEvaluation.period_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Estado</div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[fullEvaluation.status as keyof typeof statusConfig]?.className}`}>
                      <span className="text-xs">{statusConfig[fullEvaluation.status as keyof typeof statusConfig]?.emoji}</span>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[fullEvaluation.status as keyof typeof statusConfig]?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resultado Final (si está completada o en modo edición) */}
              {(isCompleted || editMode) && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Resultado Final</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${performanceConfig[performanceLevel]?.bgColor}`}>
                        <PerformanceIcon className={`h-5 w-5 ${performanceConfig[performanceLevel]?.color}`} />
                        <span className={`font-medium ${performanceConfig[performanceLevel]?.color}`}>
                          {performanceConfig[performanceLevel]?.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">{finalScore.toFixed(1)}</div>
                        <div className="text-sm text-gray-500">de 100 puntos</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progreso</span>
                        <span>{finalScore.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            finalScore >= 90 ? 'bg-green-500' :
                            finalScore >= 75 ? 'bg-blue-500' :
                            finalScore >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${finalScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Criterios de Evaluación */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Criterios de Evaluación</h3>
                
                {Object.entries(groupedCriteria).map(([category, criteria]: [string, any]) => {
                  const config = categoryConfig[category as keyof typeof categoryConfig];
                  const Icon = config?.icon || Target;
                  const totalWeight = criteria.reduce((sum: number, c: any) => sum + (c.weight || 0), 0);
                  
                  return (
                    <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${config?.color || 'bg-gray-500 text-white'}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-gray-900">{config?.label || category}</span>
                          </div>
                          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                            {(totalWeight * 100).toFixed(0)}% del total
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 text-sm font-medium text-gray-600">Criterio</th>
                              <th className="text-center py-2 text-sm font-medium text-gray-600 w-24">Peso (%)</th>
                              {(isCompleted || editMode) && (
                                <th className="text-center py-2 text-sm font-medium text-gray-600 w-32">Calificación</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {criteria.map((criterion: any) => (
                              <tr key={criterion.criteriaId} className="border-b border-gray-100">
                                <td className="py-3 text-sm text-gray-700">{criterion.description}</td>
                                <td className="py-3 text-center">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    {(criterion.weight * 100).toFixed(0)}%
                                  </span>
                                </td>
                                {(isCompleted || editMode) && (
                                  <td className="py-3 text-center">
                                    {editMode ? (
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={scores[criterion.criteriaId] || 0}
                                        onChange={(e) => handleScoreChange(criterion.criteriaId, parseFloat(e.target.value))}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                    ) : (
                                      <span className={`font-semibold ${
                                        criterion.score >= 90 ? 'text-green-600' :
                                        criterion.score >= 75 ? 'text-blue-600' :
                                        criterion.score >= 60 ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>
                                        {criterion.score?.toFixed(1) || 'N/A'}
                                      </span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer con acciones */}
        {editMode && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={() => {
                setEditMode(false);
                setScores({});
              }}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveScores}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Calificaciones
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerEvaluacionModal;