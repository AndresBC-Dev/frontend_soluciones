import React, { useState, useContext } from 'react';
import { Eye, Edit, Download, Search, AlertCircle, Clock, CheckCircle, FileCheck } from 'lucide-react';
import { AuthContext } from '../../../context/authContext';

interface Evaluation {
  id: number;
  employee_id: number;
  employee_name: string;
  evaluator_id: number;
  evaluator_name: string;
  period_id: number;
  period_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
}

interface EvaluationsSectionProps {
  evaluations: Evaluation[];
  onViewEvaluation: (evaluation: Evaluation) => void;
  onPerformEvaluation: (evaluation: Evaluation) => void;
  onExportEvaluation: (evaluation: Evaluation) => void;
}

const EvaluationsSection: React.FC<EvaluationsSectionProps> = ({
  evaluations,
  onViewEvaluation,
  onPerformEvaluation,
  onExportEvaluation,
}) => {
  const authContext = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Obtener rol y ID del usuario actual
  const currentUserRole = authContext?.user?.role?.name || '';
  const currentUserId = authContext?.user?.id || 0;

  // Filtrar evaluaciones según el rol
  const getRoleFilteredEvaluations = () => {
    switch (currentUserRole) {
      case 'admin':
      case 'hr_manager':
        // Admin y HR ven todas las evaluaciones
        return evaluations;
      
      case 'supervisor':
      case 'evaluator':
        // Evaluadores ven solo las que tienen asignadas
        return evaluations.filter(e => e.evaluator_id === currentUserId);
      
      case 'employee':
        // Empleados ven solo sus propias evaluaciones
        return evaluations.filter(e => e.employee_id === currentUserId);
      
      default:
        return [];
    }
  };

  // Aplicar filtros adicionales
  const filteredEvaluations = getRoleFilteredEvaluations().filter((evaluation) => {
    const matchesSearch = evaluation.employee_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || evaluation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Determinar si el usuario puede realizar la evaluación
  const canPerformEvaluation = (evaluation: Evaluation): boolean => {
    // Solo si es el evaluador asignado y no está completada
    if (evaluation.status === 'completed') return false;
    if (evaluation.evaluator_id !== currentUserId) return false;
    
    // Admin y HR Manager no deberían calificar evaluaciones
    if (currentUserRole === 'admin' || currentUserRole === 'hr_manager') return false;
    
    // Supervisor y Evaluator sí pueden
    return currentUserRole === 'supervisor' || currentUserRole === 'evaluator';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
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

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in_progress">En Progreso</option>
          <option value="completed">Completada</option>
          <option value="overdue">Vencida</option>
        </select>
      </div>

      {/* Mostrar mensaje según el rol */}
      {currentUserRole === 'employee' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <FileCheck className="inline w-4 h-4 mr-1" />
            Aquí puedes ver tus evaluaciones de desempeño
          </p>
        </div>
      )}

      {currentUserRole === 'evaluator' || currentUserRole === 'supervisor' ? (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-sm text-purple-700">
            <FileCheck className="inline w-4 h-4 mr-1" />
            Mostrando evaluaciones que tienes asignadas para realizar
          </p>
        </div>
      ) : null}

      {filteredEvaluations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {evaluations.length === 0 
              ? "No hay evaluaciones disponibles"
              : "No se encontraron evaluaciones con los criterios seleccionados"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEvaluations.map((evaluation) => (
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
                  {/* Botón Ver - Siempre visible */}
                  <button
                    onClick={() => onViewEvaluation(evaluation)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Ver evaluación"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </button>
                  
                  {/* Botón Realizar - Solo si puede realizarla */}
                  {canPerformEvaluation(evaluation) && (
                    <button
                      onClick={() => onPerformEvaluation(evaluation)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Realizar evaluación"
                    >
                      <Edit className="w-4 h-4 text-purple-600" />
                    </button>
                  )}
                  
                  {/* Botón Exportar - Siempre visible */}
                  <button
                    onClick={() => onExportEvaluation(evaluation)}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                    title="Exportar evaluación"
                  >
                    <Download className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {filteredEvaluations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredEvaluations.filter(e => e.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredEvaluations.filter(e => e.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-600">En Progreso</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {filteredEvaluations.filter(e => e.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {filteredEvaluations.filter(e => e.status === 'overdue').length}
              </p>
              <p className="text-sm text-gray-600">Vencidas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationsSection;