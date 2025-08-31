// src/pages/GestionEvaluacionesPage/index.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

// Componentes internos
import HeaderSection from './components/HeaderSection';
import ConfigurationPanel from './components/ConfigurationPanel';
import EvaluationsPanel from './components/EvaluationPanel';

// Tipos
import type { 
  Period, 
  Criteria, 
  Template, 
  Evaluation, 
  Stats, 
  ConfirmationState 
} from './types';

// Servicios
import {
  getCriteria,
  getPeriods,
  getTemplates,
  getEvaluations,
  deleteCriteria,
  deletePeriod,
  deleteTemplate,
  deleteEvaluation,
  cloneTemplate,
} from '../../services/evaluationService';

// Modales
import CrearCriterioModal from '../../components/CrearCriterioModal';
import CrearPeriodoModal from '../../components/CrearPeriodoModal';
import CrearPlantillaModal from '../../components/CrearPlantillaModal';
import CrearEvaluacionModal from '../../components/CrearEvaluacionModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const GestionEvaluacionesPage: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<'periodos' | 'criterios' | 'plantillas'>('periodos');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de datos
  const [periods, setPeriods] = useState<Period[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | string>('todos');

  // Estados de carga individual
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [cloningItems, setCloningItems] = useState<Set<number>>(new Set());

  // Estados de modales
  const [showCrearCriterioModal, setShowCrearCriterioModal] = useState(false);
  const [showCrearPeriodoModal, setShowCrearPeriodoModal] = useState(false);
  const [showCrearPlantillaModal, setShowCrearPlantillaModal] = useState(false);
  const [showCrearEvaluacionModal, setShowCrearEvaluacionModal] = useState(false);

  // Estado del modal de confirmación
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
    loading: false
  });

  // Carga inicial de datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [periodsData, criteriaData, templatesData, evaluationsData] = await Promise.all([
        getPeriods(),
        getCriteria(),
        getTemplates(),
        getEvaluations()
      ]);

      setPeriods(periodsData);
      setCriteria(criteriaData);
      setTemplates(templatesData);
      setEvaluations(evaluationsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Cálculo de estadísticas
  const stats = useMemo<Stats>(() => ({
    totalPeriods: periods.length,
    activePeriods: periods.filter(p => p.is_active).length,
    totalCriteria: criteria.length,
    totalTemplates: templates.length,
    totalEvaluations: evaluations.length,
    averageWeight: criteria.length > 0 
      ? Math.round(criteria.reduce((sum, c) => sum + c.weight, 0) / criteria.length)
      : 0
  }), [periods, criteria, templates, evaluations]);

  // Categorías únicas
  const categories = useMemo(() => {
    const cats = ['todos', ...new Set(criteria.map(c => c.category))];
    return cats;
  }, [criteria]);

  // Función helper para mostrar confirmación
  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' | 'success' = 'warning'
  ) => {
    setConfirmationState({
      show: true,
      title,
      message,
      onConfirm,
      type,
      loading: false
    });
  };

  const hideConfirmation = () => {
    setConfirmationState(prev => ({ ...prev, show: false }));
  };

  // Handlers para Períodos
  const handleEditPeriod = (period: Period) => {
    console.log('Edit period:', period);
    // Aquí implementarías la lógica de edición
  };

  const handleDeletePeriod = (period: Period) => {
    showConfirmation(
      'Eliminar Período',
      `¿Está seguro de que desea eliminar el período "${period.name}"? Esta acción no se puede deshacer.`,
      async () => {
        setConfirmationState(prev => ({ ...prev, loading: true }));
        setDeletingItems(prev => new Set(prev).add(period.id));
        try {
          await deletePeriod(period.id);
          setPeriods(prev => prev.filter(p => p.id !== period.id));
          hideConfirmation();
        } catch (error) {
          console.error('Error deleting period:', error);
          alert('Error al eliminar el período');
        } finally {
          setDeletingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(period.id);
            return newSet;
          });
          setConfirmationState(prev => ({ ...prev, loading: false }));
        }
      },
      'danger'
    );
  };

  // Handlers para Criterios
  const handleEditCriteria = (criteria: Criteria) => {
    console.log('Edit criteria:', criteria);
    // Aquí implementarías la lógica de edición
  };

  const handleDeleteCriteria = (criteria: Criteria) => {
    showConfirmation(
      'Eliminar Criterio',
      `¿Está seguro de que desea eliminar el criterio "${criteria.name}"? Esta acción no se puede deshacer.`,
      async () => {
        setConfirmationState(prev => ({ ...prev, loading: true }));
        setDeletingItems(prev => new Set(prev).add(criteria.id));
        try {
          await deleteCriteria(criteria.id);
          setCriteria(prev => prev.filter(c => c.id !== criteria.id));
          hideConfirmation();
        } catch (error) {
          console.error('Error deleting criteria:', error);
          alert('Error al eliminar el criterio');
        } finally {
          setDeletingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(criteria.id);
            return newSet;
          });
          setConfirmationState(prev => ({ ...prev, loading: false }));
        }
      },
      'danger'
    );
  };

  // Handlers para Plantillas
  const handleViewTemplate = (template: Template) => {
    console.log('View template:', template);
    // Aquí implementarías la lógica de visualización
  };

  const handleCloneTemplate = async (template: Template) => {
    setCloningItems(prev => new Set(prev).add(template.id));
    try {
      const clonedTemplate = await cloneTemplate(template.id);
      setTemplates(prev => [...prev, clonedTemplate]);
    } catch (error) {
      console.error('Error cloning template:', error);
      alert('Error al clonar la plantilla');
    } finally {
      setCloningItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.id);
        return newSet;
      });
    }
  };

  const handleGenerateEval = (template: Template) => {
    console.log('Generate evaluation from template:', template);
    setShowCrearEvaluacionModal(true);
  };

  const handleDeleteTemplate = (template: Template) => {
    showConfirmation(
      'Eliminar Plantilla',
      `¿Está seguro de que desea eliminar la plantilla "${template.name}"? Esta acción no se puede deshacer.`,
      async () => {
        setConfirmationState(prev => ({ ...prev, loading: true }));
        setDeletingItems(prev => new Set(prev).add(template.id));
        try {
          await deleteTemplate(template.id);
          setTemplates(prev => prev.filter(t => t.id !== template.id));
          hideConfirmation();
        } catch (error) {
          console.error('Error deleting template:', error);
          alert('Error al eliminar la plantilla');
        } finally {
          setDeletingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(template.id);
            return newSet;
          });
          setConfirmationState(prev => ({ ...prev, loading: false }));
        }
      },
      'danger'
    );
  };

  // Handlers para Evaluaciones
  const handleViewEvaluation = (evaluation: Evaluation) => {
    console.log('View evaluation:', evaluation);
    // Aquí implementarías la lógica de visualización
  };

  const handleDeleteEvaluation = (evaluation: Evaluation) => {
    showConfirmation(
      'Eliminar Evaluación',
      `¿Está seguro de que desea eliminar la evaluación de "${evaluation.employee_name}"? Esta acción no se puede deshacer.`,
      async () => {
        setConfirmationState(prev => ({ ...prev, loading: true }));
        setDeletingItems(prev => new Set(prev).add(evaluation.id));
        try {
          await deleteEvaluation(evaluation.id);
          setEvaluations(prev => prev.filter(e => e.id !== evaluation.id));
          hideConfirmation();
        } catch (error) {
          console.error('Error deleting evaluation:', error);
          alert('Error al eliminar la evaluación');
        } finally {
          setDeletingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(evaluation.id);
            return newSet;
          });
          setConfirmationState(prev => ({ ...prev, loading: false }));
        }
      },
      'danger'
    );
  };

  // Handlers de creación exitosa
  const handlePeriodCreated = (period: Period) => {
    setPeriods(prev => [...prev, period]);
    setShowCrearPeriodoModal(false);
  };

  const handleCriteriaCreated = (criteria: Criteria) => {
    setCriteria(prev => [...prev, criteria]);
    setShowCrearCriterioModal(false);
  };

  const handleTemplateCreated = (template: Template) => {
    setTemplates(prev => [...prev, template]);
    setShowCrearPlantillaModal(false);
  };

  const handleEvaluationCreated = () => {
    loadData(); // Recargar para obtener las nuevas evaluaciones
    setShowCrearEvaluacionModal(false);
  };

  // Renderizado de estados de carga y error
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Error al cargar los datos</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      {/* Header con estadísticas */}
      <HeaderSection
        stats={stats}
        categories={categories}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Layout Bento - Grid principal */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-300px)]">
        {/* Panel Izquierdo - Configuración (5 columnas) */}
        <div className="col-span-5 flex flex-col">
          <ConfigurationPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            periods={periods}
            criteria={criteria}
            templates={templates}
            deletingItems={deletingItems}
            cloningItems={cloningItems}
            onCreatePeriod={() => setShowCrearPeriodoModal(true)}
            onCreateCriteria={() => setShowCrearCriterioModal(true)}
            onCreateTemplate={() => setShowCrearPlantillaModal(true)}
            onEditPeriod={handleEditPeriod}
            onDeletePeriod={handleDeletePeriod}
            onEditCriteria={handleEditCriteria}
            onDeleteCriteria={handleDeleteCriteria}
            onViewTemplate={handleViewTemplate}
            onCloneTemplate={handleCloneTemplate}
            onGenerateEval={handleGenerateEval}
            onDeleteTemplate={handleDeleteTemplate}
          />
        </div>

        {/* Panel Derecho - Evaluaciones (7 columnas) */}
        <div className="col-span-7 flex flex-col">
          <EvaluationsPanel
            evaluations={evaluations}
            deletingItems={deletingItems}
            onCreateEvaluation={() => setShowCrearEvaluacionModal(true)}
            onViewEvaluation={handleViewEvaluation}
            onDeleteEvaluation={handleDeleteEvaluation}
          />
        </div>
      </div>

      {/* Modales */}
      <CrearCriterioModal
        show={showCrearCriterioModal}
        onClose={() => setShowCrearCriterioModal(false)}
        onCreated={handleCriteriaCreated}
      />

      <CrearPeriodoModal
        show={showCrearPeriodoModal}
        onClose={() => setShowCrearPeriodoModal(false)}
        onCreated={handlePeriodCreated}
      />

      <CrearPlantillaModal
        show={showCrearPlantillaModal}
        onClose={() => setShowCrearPlantillaModal(false)}
        onCreated={handleTemplateCreated}
      />

      <CrearEvaluacionModal
        show={showCrearEvaluacionModal}
        onClose={() => setShowCrearEvaluacionModal(false)}
        onCreated={handleEvaluationCreated}
      />

      <ConfirmationModal
        show={confirmationState.show}
        onClose={hideConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        type={confirmationState.type}
        loading={confirmationState.loading}
        confirmText={confirmationState.type === 'success' ? 'Entendido' : 'Confirmar'}
      />
    </div>
  );
};

export default GestionEvaluacionesPage;