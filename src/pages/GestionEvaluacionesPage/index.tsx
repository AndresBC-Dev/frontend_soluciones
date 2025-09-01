import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

// Componentes internos
import HeaderSection from './components/HeaderSection';
import ConfigurationPanel from './components/ConfigurationPanel';
import EvaluationsPanel from './components/EvaluationsPanel';

// Tipos
import type { Period, Criteria, Template, Evaluation, Stats } from '../../types/evaluation';

// Servicios
import {
    getCriteria,
    getPeriods,
    getTemplates,
    getEvaluations,
    deleteCriteria,
    deactivatePeriod,
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
import EditarPeriodoModal from '../../components/EditarPeriodoModal';
import EditarCriterioModal from '../../components/EditarCriterioModal';
import EditarPlantillaModal from '../../components/EditarPlantillaModal';
import VerEvaluacionModal from '../../components/VerEvaluacionModal';

interface ConfirmationState {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info' | 'success';
    loading: boolean;
}

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
    const [selectedCategory, setSelectedCategory] = useState<string>('todos');
    const [showInactivePeriods, setShowInactivePeriods] = useState(false);

    // Estados de carga individual
    const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
    const [cloningItems, setCloningItems] = useState<Set<number>>(new Set());

    // Estados de modales
    const [showCrearCriterioModal, setShowCrearCriterioModal] = useState(false);
    const [showCrearPeriodoModal, setShowCrearPeriodoModal] = useState(false);
    const [showCrearPlantillaModal, setShowCrearPlantillaModal] = useState(false);
    const [showCrearEvaluacionModal, setShowCrearEvaluacionModal] = useState(false);
    const [showEditarPeriodoModal, setShowEditarPeriodoModal] = useState(false);
    const [showEditarCriterioModal, setShowEditarCriterioModal] = useState(false);
    const [showEditarPlantillaModal, setShowEditarPlantillaModal] = useState(false);
    const [showVerEvaluacionModal, setShowVerEvaluacionModal] = useState(false);
    const [periodToEdit, setPeriodToEdit] = useState<Period | null>(null);
    const [criteriaToEdit, setCriteriaToEdit] = useState<Criteria | null>(null);
    const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
    const [evaluationToView, setEvaluationToView] = useState<Evaluation | null>(null);

    // Estado del modal de confirmación
    const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
        show: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning',
        loading: false,
    });

    // DEBUG: Efecto para verificar cambios en el estado
    useEffect(() => {
        console.log('🔍 DEBUG - Periods state changed:', {
            total: periods.length,
            active: periods.filter(p => p.is_active).length,
            inactive: periods.filter(p => !p.is_active).length,
            showingInactive: showInactivePeriods,
            allPeriods: periods.map(p => ({
                id: p.id,
                name: p.name,
                is_active: p.is_active
            }))
        });
    }, [periods, showInactivePeriods]);

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
                getEvaluations(),
            ]);

            const sortedPeriods = periodsData.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            });

            setPeriods(sortedPeriods);
            setCriteria(criteriaData);
            setTemplates(templatesData);
            setEvaluations(evaluationsData);
            console.log('✅ Data loaded successfully');
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
            : 0,
    }), [periods, criteria, templates, evaluations]);

    // Categorías únicas
    const categories = useMemo(() => {
        const cats: string[] = [
            'todos',
            ...new Set(criteria.map(c => c.category)),
        ];
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
            loading: false,
        });
    };

    const hideConfirmation = () => {
        setConfirmationState(prev => ({ ...prev, show: false }));
    };

    // Handlers para Períodos
    const handleEditPeriod = (period: Period) => {
        setPeriodToEdit(period);
        setShowEditarPeriodoModal(true);
    };

    const handlePeriodUpdated = (updatedPeriod: Period) => {
        const wasActive = periods.find(p => p.id === updatedPeriod.id)?.is_active;
        const isNowActive = updatedPeriod.is_active;
        
        setPeriods(prev => {
            const newPeriods = prev.map(p => 
                p.id === updatedPeriod.id ? updatedPeriod : p
            );
            console.log('✅ Period updated in state:', updatedPeriod);
            return newPeriods;
        });
        
        // Si el período cambió de activo a inactivo o viceversa
        if (wasActive !== isNowActive) {
            // Mostrar períodos inactivos si se desactivó
            if (!isNowActive) {
                setShowInactivePeriods(true);
            }
            
            const statusMessage = isNowActive 
                ? 'activado' 
                : 'desactivado';
                
            showConfirmation(
                'Período Actualizado',
                `El período "${updatedPeriod.name}" ha sido ${statusMessage} exitosamente.`,
                () => hideConfirmation(),
                'success'
            );
        } else {
            showConfirmation(
                'Período Actualizado',
                `El período "${updatedPeriod.name}" ha sido actualizado exitosamente.`,
                () => hideConfirmation(),
                'success'
            );
        }
        
        setShowEditarPeriodoModal(false);
        setPeriodToEdit(null);
    };

    const handlePeriodCreated = (period: Period) => {
        setPeriods(prev => {
            const newPeriods = [period, ...prev].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            });
            console.log('✅ New period created:', period);
            return newPeriods;
        });
        setShowCrearPeriodoModal(false);
        showConfirmation(
            'Período Creado',
            `El período "${period.name}" ha sido creado exitosamente.`,
            () => hideConfirmation(),
            'success'
        );
    };

    const handleDeletePeriod = (period: Period) => {
        if (!period.is_active) {
            showConfirmation(
                'Período ya inactivo',
                `El período "${period.name}" ya está desactivado.`,
                () => hideConfirmation(),
                'info'
            );
            return;
        }

        showConfirmation(
            'Desactivar Período',
            `¿Está seguro de que desea desactivar el período "${period.name}"? 
            
            El período:
            • No se podrá usar para crear nuevas evaluaciones
            • Las evaluaciones existentes no se verán afectadas
            • Podrá reactivarlo desde el modo de edición`,
            async () => {
                setConfirmationState(prev => ({ ...prev, loading: true }));
                setDeletingItems(prev => new Set(prev).add(period.id));

                try {
                    const updatedPeriod = await deactivatePeriod(period.id);
                    
                    // Actualizar el estado de períodos
                    setPeriods(prev => {
                        const newPeriods = prev.map(p => 
                            p.id === period.id ? updatedPeriod : p
                        );
                        return newPeriods;
                    });
                    
                    // Activar vista de períodos inactivos
                    setShowInactivePeriods(true);
                    
                    hideConfirmation();
                    
                    // Mostrar confirmación de éxito
                    showConfirmation(
                        'Período Desactivado',
                        `El período "${period.name}" ha sido desactivado exitosamente.
                        
                        Ahora se muestra en la lista de períodos inactivos.`,
                        () => hideConfirmation(),
                        'success'
                    );
                } catch (error) {
                    console.error('❌ Error deactivating period:', error);
                    showConfirmation(
                        'Error',
                        'No se pudo desactivar el período. Por favor, intente nuevamente.',
                        () => hideConfirmation(),
                        'danger'
                    );
                } finally {
                    setDeletingItems(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(period.id);
                        return newSet;
                    });
                    setConfirmationState(prev => ({ ...prev, loading: false }));
                }
            },
            'warning'
        );
    };

    // Handlers para Criterios
    const handleEditCriteria = (criteria: Criteria) => {
        setCriteriaToEdit(criteria);
        setShowEditarCriterioModal(true);
    };

    const handleCriteriaUpdated = (updatedCriteria: Criteria) => {
        setCriteria(prev => prev.map(c => c.id === updatedCriteria.id ? updatedCriteria : c));
        setShowEditarCriterioModal(false);
        setCriteriaToEdit(null);
        showConfirmation(
            'Criterio Actualizado',
            `El criterio "${updatedCriteria.name}" ha sido actualizado exitosamente.`,
            () => hideConfirmation(),
            'success'
        );
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
                    showConfirmation(
                        'Error',
                        'Error al eliminar el criterio. Por favor, intente nuevamente.',
                        () => hideConfirmation(),
                        'danger'
                    );
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
    const handleEditTemplate = (template: Template) => {
        setTemplateToEdit(template);
        setShowEditarPlantillaModal(true);
    };

    const handleTemplateUpdated = (updatedTemplate: Template) => {
        setTemplates(prev => {
            const newTemplates = prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t);
            return newTemplates;
        });
        setShowEditarPlantillaModal(false);
        setTemplateToEdit(null);
        showConfirmation(
            'Plantilla Actualizada',
            `La plantilla "${updatedTemplate.name}" ha sido actualizada exitosamente.`,
            () => hideConfirmation(),
            'success'
        );
    };

    const handleViewTemplate = (template: Template) => {
        console.log('View template:', template);
    };

    const handleCloneTemplate = async (template: Template) => {
        setCloningItems(prev => new Set(prev).add(template.id));
        try {
            const clonedTemplate = await cloneTemplate(template.id);
            setTemplates(prev => [...prev, clonedTemplate]);
            showConfirmation(
                'Plantilla Clonada',
                `La plantilla "${clonedTemplate.name}" ha sido clonada exitosamente.`,
                () => hideConfirmation(),
                'success'
            );
        } catch (error) {
            console.error('Error cloning template:', error);
            showConfirmation(
                'Error',
                'Error al clonar la plantilla. Por favor, intente nuevamente.',
                () => hideConfirmation(),
                'danger'
            );
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
        setTemplateToEdit(template);
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
                    showConfirmation(
                        'Error',
                        'Error al eliminar la plantilla. Por favor, intente nuevamente.',
                        () => hideConfirmation(),
                        'danger'
                    );
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
        setEvaluationToView(evaluation);
        setShowVerEvaluacionModal(true);
    };

    const handlePerformEvaluation = (evaluation: Evaluation) => {
        setEvaluationToView(evaluation);
        setShowVerEvaluacionModal(true);
    };

    const handleEvaluationUpdated = (updatedEvaluation: Evaluation) => {
        setEvaluations(prev => {
            const newEvaluations = prev.map(e => e.id === updatedEvaluation.id ? updatedEvaluation : e);
            return newEvaluations;
        });
        setShowVerEvaluacionModal(false);
        setEvaluationToView(null);
        showConfirmation(
            'Evaluación Actualizada',
            `La evaluación de "${updatedEvaluation.employee_name}" ha sido actualizada exitosamente.`,
            () => hideConfirmation(),
            'success'
        );
    };

    const handleExportEvaluation = (evaluation: Evaluation) => {
        console.log('Export evaluation:', evaluation);
        showConfirmation(
            'Evaluación Exportada',
            `La evaluación de "${evaluation.employee_name}" ha sido exportada como PDF.`,
            () => hideConfirmation(),
            'success'
        );
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
                    showConfirmation(
                        'Error',
                        'Error al eliminar la evaluación. Por favor, intente nuevamente.',
                        () => hideConfirmation(),
                        'danger'
                    );
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
    const handleCriteriaCreated = (criteria: Criteria) => {
        setCriteria(prev => [...prev, criteria]);
        setShowCrearCriterioModal(false);
        showConfirmation(
            'Criterio Creado',
            `El criterio "${criteria.name}" ha sido creado exitosamente.`,
            () => hideConfirmation(),
            'success'
        );
    };

    const handleTemplateCreated = (template: Template) => {
        setTemplates(prev => [...prev, template]);
        setShowCrearPlantillaModal(false);
        showConfirmation(
            'Plantilla Creada',
            `La plantilla "${template.name}" ha sido creada exitosamente.`,
            () => hideConfirmation(),
            'success'
        );
    };

    const handleEvaluationCreated = () => {
        loadData();
        setShowCrearEvaluacionModal(false);
        setTemplateToEdit(null);
        showConfirmation(
            'Evaluación Creada',
            'La evaluación ha sido creada exitosamente.',
            () => hideConfirmation(),
            'success'
        );
    };

    // Renderizado de estados de carga y error
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl shadow-lg p-8">
                    <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold mb-2">Error al cargar los datos</p>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="p-6 h-screen flex flex-col">
                {/* Header Section */}
                <HeaderSection
                    stats={stats}
                    categories={categories}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
                
                {/* Main Content Grid */}
                <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
                    {/* Configuration Panel - Left Side */}
                    <div className="col-span-5 flex flex-col">
                        <ConfigurationPanel
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            categories={categories}
                            showInactivePeriods={showInactivePeriods}
                            setShowInactivePeriods={setShowInactivePeriods}
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
                            onEditTemplate={handleEditTemplate}
                        />
                    </div>
                    
                    {/* Evaluations Panel - Right Side */}
                    <div className="col-span-7 flex flex-col">
                        <EvaluationsPanel
                            evaluations={evaluations}
                            deletingItems={deletingItems}
                            onCreateEvaluation={() => setShowCrearEvaluacionModal(true)}
                            onViewEvaluation={handleViewEvaluation}
                            onPerformEvaluation={handlePerformEvaluation}
                            onDeleteEvaluation={handleDeleteEvaluation}
                            onExportEvaluation={handleExportEvaluation}
                        />
                    </div>
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
            <EditarPeriodoModal
                show={showEditarPeriodoModal}
                period={periodToEdit}
                onClose={() => {
                    setShowEditarPeriodoModal(false);
                    setPeriodToEdit(null);
                }}
                onUpdated={handlePeriodUpdated}
            />
            <CrearPlantillaModal
                show={showCrearPlantillaModal}
                onClose={() => setShowCrearPlantillaModal(false)}
                onCreated={handleTemplateCreated}
            />
            <EditarPlantillaModal
                show={showEditarPlantillaModal}
                template={templateToEdit}
                onClose={() => {
                    setShowEditarPlantillaModal(false);
                    setTemplateToEdit(null);
                }}
                onUpdated={handleTemplateUpdated}
            />
            <CrearEvaluacionModal
                show={showCrearEvaluacionModal}
                onClose={() => {
                    setShowCrearEvaluacionModal(false);
                    setTemplateToEdit(null);
                }}
                onCreated={handleEvaluationCreated}
            />
            <EditarCriterioModal
                show={showEditarCriterioModal}
                criteria={criteriaToEdit}
                onClose={() => {
                    setShowEditarCriterioModal(false);
                    setCriteriaToEdit(null);
                }}
                onUpdated={handleCriteriaUpdated}
            />
            <VerEvaluacionModal
                show={showVerEvaluacionModal}
                evaluation={evaluationToView}
                onClose={() => {
                    setShowVerEvaluacionModal(false);
                    setEvaluationToView(null);
                }}
                onUpdated={handleEvaluationUpdated}
                onExport={handleExportEvaluation}
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