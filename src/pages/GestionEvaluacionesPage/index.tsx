// src/pages/GestionEvaluacionesPage/index.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    Calendar,
    Target,
    Plus,
    Search,
    Filter,
    BarChart3,
    Loader2,
    RefreshCw,
    Eye,
    EyeOff
} from 'lucide-react';

import {
    getPeriods,
    getCriteria,
    getTemplates,
    getEvaluations,
    deleteCriteria,
    deleteTemplate,
    deactivatePeriod,
    act
} from '../../services/evaluationService';

import type { Period, Criteria, Template, Evaluation } from '../../types/evaluation';

import CrearPeriodoModal from '../../components/CrearPeriodoModal';
import EditarPeriodoModal from '../../components/EditarPeriodoModal';
import CrearCriterioModal from '../../components/CrearCriterioModal';
import EditarCriterioModal from '../../components/EditarCriterioModal';
import CrearPlantillaModal from '../../components/CrearPlantillaModal';
//import EditarPlantillaModal from '../../components/EditarPlantillaModal';
import CrearEvaluacionModal from '../../components/CrearEvaluacionModal';
import ConfirmationModal from '../../components/ConfirmationModal';

import StatCard from './components/StatCard';
import PeriodsSection from './components/ConfigurationPanel/PeriodsSection';
import CriteriaSection from './components/ConfigurationPanel/CriteriaSection';
import TemplatesSection from './components/ConfigurationPanel/TemplatesSection';
//import EvaluationsSection from './components/ConfigurationPanel/EvaluationsSection';
import EditarPlantillaModal from '../../components/EditarPlantillaModal';

// Tipos
type TabType = 'periods' | 'criteria' | 'templates' | 'evaluations';

interface Stats {
    totalPeriods: number;
    activePeriods: number;
    totalCriteria: number;
    totalTemplates: number;
    totalEvaluations: number;
    averageWeight: number;
}

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
    const [periods, setPeriods] = useState<Period[]>([]);
    const [criteria, setCriteria] = useState<Criteria[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

    // Estados de UI
    const [activeTab, setActiveTab] = useState<TabType>('periods');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [showInactivePeriods, setShowInactivePeriods] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());

    // Estados de modales
    const [showCrearPeriodoModal, setShowCrearPeriodoModal] = useState(false);
    const [showEditarPeriodoModal, setShowEditarPeriodoModal] = useState(false);
    const [periodToEdit, setPeriodToEdit] = useState<Period | null>(null);

    const [showCrearCriterioModal, setShowCrearCriterioModal] = useState(false);
    const [showEditarCriterioModal, setShowEditarCriterioModal] = useState(false);
    const [criteriaToEdit, setCriteriaToEdit] = useState<Criteria | null>(null);

    const [showCrearPlantillaModal, setShowCrearPlantillaModal] = useState(false);
    const [showEditarPlantillaModal, setShowEditarPlantillaModal] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);

    const [showCrearEvaluacionModal, setShowCrearEvaluacionModal] = useState(false);

    const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
        show: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning',
        loading: false
    });

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [periodsData, criteriaData, templatesData, evaluationsData] = await Promise.all([
                getPeriods().catch(() => []),
                getCriteria().catch(() => []),
                getTemplates().catch(() => []),
                getEvaluations().catch(() => [])
            ]);

            setPeriods(Array.isArray(periodsData) ? periodsData : []);
            setCriteria(Array.isArray(criteriaData) ? criteriaData : []);
            setTemplates(Array.isArray(templatesData) ? templatesData : []);
            setEvaluations(Array.isArray(evaluationsData) ? evaluationsData : []);
        } catch (error) {
            console.error('Error loading data:', error);
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
        setPeriodToEdit(period);
        setShowEditarPeriodoModal(true);
    };

    const handlePeriodUpdated = (updatedPeriod: Period) => {
        setPeriods(prev => {
            const newPeriods = prev.map(p => p.id === updatedPeriod.id ? updatedPeriod : p);
            console.log('📊 Periods state after update:', newPeriods);
            return newPeriods;
        });
        setShowEditarPeriodoModal(false);
        setPeriodToEdit(null);
        showConfirmation(
            'Período Actualizado',
            `El período "${updatedPeriod.name}" ha sido actualizado exitosamente.`,
            () => hideConfirmation(),
            'success'
        );
    };

    const handlePeriodCreated = (period: Period) => {
        setPeriods(prev => {
            const newPeriods = [...prev, period];
            console.log('📊 Periods state after creation:', newPeriods);
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
            // Si está inactivo, ofrecer reactivar
            showConfirmation(
                'Reactivar Período',
                `¿Desea reactivar el período "${period.name}"?

El período:
    • Volverá a estar disponible para crear nuevas evaluaciones
    • Será visible en la sección de períodos activos`,
                async () => {
                    setConfirmationState(prev => ({ ...prev, loading: true }));
                    setDeletingItems(prev => new Set(prev).add(period.id));

                    try {
                        const reactivatedPeriod = await activatePeriod(period.id);
                        setPeriods(prev => {
                            const newPeriods = prev.map(p => p.id === period.id ? reactivatedPeriod : p);
                            console.log('📊 Periods state after reactivate:', newPeriods);
                            return newPeriods;
                        });
                        hideConfirmation();
                        showConfirmation(
                            'Período Reactivado',
                            `El período "${period.name}" ha sido reactivado exitosamente.`,
                            () => hideConfirmation(),
                            'success'
                        );
                    } catch (error) {
                        console.error('Error reactivating period:', error);
                        showConfirmation(
                            'Error',
                            'No se pudo reactivar el período. Por favor, intente nuevamente.',
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
                'info'
            );
        } else {
            // Si está activo, ofrecer desactivar
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
                        setPeriods(prev => {
                            const newPeriods = prev.map(p => p.id === period.id ? updatedPeriod : p);
                            console.log('📊 Periods state after deactivate:', newPeriods);
                            return newPeriods;
                        });
                        hideConfirmation();
                        showConfirmation(
                            'Período Desactivado',
                            `El período "${period.name}" ha sido desactivado exitosamente.`,
                            () => hideConfirmation(),
                            'success'
                        );
                    } catch (error) {
                        console.error('Error deactivating period:', error);
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
        }
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
        setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
        setShowEditarPlantillaModal(false);
        setTemplateToEdit(null);
        showConfirmation(
            'Plantilla Actualizada',
            `La plantilla "${updatedTemplate.name}" ha sido actualizada exitosamente.`,
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
    const handleEvaluationCreated = (evaluation: Evaluation) => {
        setEvaluations(prev => [...prev, evaluation]);
        setShowCrearEvaluacionModal(false);
        showConfirmation(
            'Evaluación Creada',
            'La evaluación ha sido creada exitosamente.',
            () => hideConfirmation(),
            'success'
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando datos...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestión de Evaluaciones
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Administra períodos, criterios, plantillas y evaluaciones
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <StatCard
                            title="Total Períodos"
                            value={stats.totalPeriods}
                            icon={<Calendar />}
                            color="blue"
                        />
                        <StatCard
                            title="Períodos Activos"
                            value={stats.activePeriods}
                            icon={<Calendar />}
                            color="green"
                        />
                        <StatCard
                            title="Total Criterios"
                            value={stats.totalCriteria}
                            icon={<Target />}
                            color="purple"
                        />
                        <StatCard
                            title="Total Plantillas"
                            value={stats.totalTemplates}
                            icon={<FileText />}
                            color="orange"
                        />
                        <StatCard
                            title="Total Evaluaciones"
                            value={stats.totalEvaluations}
                            icon={<BarChart3 />}
                            color="red"
                        />
                        <StatCard
                            title="Peso Promedio"
                            value={`${stats.averageWeight}%`}
                            icon={<Target />}
                            color="gray"
                        />
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'periods', label: 'Períodos', icon: Calendar },
                                { id: 'criteria', label: 'Criterios', icon: Target },
                                { id: 'templates', label: 'Plantillas', icon: FileText },
                                { id: 'evaluations', label: 'Evaluaciones', icon: BarChart3 },
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id as TabType)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={`Buscar ${activeTab === 'periods' ? 'períodos' :
                                activeTab === 'criteria' ? 'criterios' :
                                    activeTab === 'templates' ? 'plantillas' : 'evaluaciones'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Filtros específicos por tab */}
                    {activeTab === 'criteria' && (
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'todos' ? 'Todas las categorías' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {activeTab === 'periods' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowInactivePeriods(!showInactivePeriods)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showInactivePeriods
                                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                                        : 'bg-gray-50 border-gray-300 text-gray-600'
                                    }`}
                            >
                                {showInactivePeriods ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {showInactivePeriods ? 'Mostrar todos' : 'Solo activos'}
                            </button>
                        </div>
                    )}

                    {/* Botón de crear */}
                    <button
                        onClick={() => {
                            if (activeTab === 'periods') setShowCrearPeriodoModal(true);
                            else if (activeTab === 'criteria') setShowCrearCriterioModal(true);
                            else if (activeTab === 'templates') setShowCrearPlantillaModal(true);
                            else if (activeTab === 'evaluations') setShowCrearEvaluacionModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Crear {activeTab === 'periods' ? 'Período' :
                            activeTab === 'criteria' ? 'Criterio' :
                                activeTab === 'templates' ? 'Plantilla' : 'Evaluación'}
                    </button>
                </div>

                {/* Content Sections */}
                {activeTab === 'periods' && (
                    <PeriodsSection
                        periods={periods}
                        searchTerm={searchTerm}
                        showInactivePeriods={showInactivePeriods}
                        deletingItems={deletingItems}
                        onEdit={handleEditPeriod}
                        onDelete={handleDeletePeriod}
                    />
                )}

                {activeTab === 'criteria' && (
                    <CriteriaSection
                        criteria={criteria}
                        searchTerm={searchTerm}
                        selectedCategory={selectedCategory}
                        deletingItems={deletingItems}
                        onEdit={handleEditCriteria}
                        onDelete={handleDeleteCriteria}
                    />
                )}

                {activeTab === 'templates' && (
                    <TemplatesSection
                        templates={templates}
                        searchTerm={searchTerm}
                        deletingItems={deletingItems}
                        onEdit={handleEditTemplate}
                        onDelete={handleDeleteTemplate}
                    />
                )}

                {activeTab === 'evaluations' && (
                    <EvaluationsSection
                        evaluations={evaluations}
                        searchTerm={searchTerm}
                    />
                )}

                {/* Modales */}
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

                <CrearCriterioModal
                    show={showCrearCriterioModal}
                    onClose={() => setShowCrearCriterioModal(false)}
                    onCreated={handleCriteriaCreated}
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
                    onClose={() => setShowCrearEvaluacionModal(false)}
                    onCreated={handleEvaluationCreated}
                />

                <ConfirmationModal
                    show={confirmationState.show}
                    title={confirmationState.title}
                    message={confirmationState.message}
                    type={confirmationState.type}
                    loading={confirmationState.loading}
                    onConfirm={confirmationState.onConfirm}
                    onCancel={hideConfirmation}
                />
            </div>
        </div>
    );
};

export default GestionEvaluacionesPage;