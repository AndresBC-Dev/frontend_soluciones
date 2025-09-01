import React, { useState, useEffect } from 'react';
import PeriodsSection from './components/ConfigurationPanel/PeriodsSection';
import CriteriaSection from './components/ConfigurationPanel/CriteriaSection';
import EditarPeriodoModal from '../../components/EditarPeriodoModal';
import CrearCriterioModal from '../../components/CrearCriterioModal';
import { getPeriods, updatePeriod, deactivatePeriod, getCriteria, deactivateCriteria, reactivateCriteria } from '../../services/evaluationService';
import type { Period, Criteria } from '../../types/evaluation';

const GestionEvaluacionesPage: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactivePeriods, setShowInactivePeriods] = useState(false);
  const [showInactiveCriteria, setShowInactiveCriteria] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'productivity' | 'work_conduct' | 'skills'>('todos');
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [showEditarPeriodoModal, setShowEditarPeriodoModal] = useState(false);
  const [showCrearCriterioModal, setShowCrearCriterioModal] = useState(false);
  const [periodToEdit, setPeriodToEdit] = useState<Period | null>(null);

  const loadData = async () => {
    try {
      const [periodsData, criteriaData] = await Promise.all([getPeriods(), getCriteria()]);
      setPeriods(periodsData);
      setCriteria(criteriaData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditPeriod = (period: Period) => {
    setPeriodToEdit(period);
    setShowEditarPeriodoModal(true);
  };

  const handleDeletePeriod = async (period: Period) => {
    setDeletingItems(prev => new Set(prev).add(period.id));
    try {
      await deactivatePeriod(period.id);
      await loadData();
    } catch (error) {
      console.error('Error deactivating period:', error);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(period.id);
        return newSet;
      });
    }
  };

  const handlePeriodUpdated = (updatedPeriod: Period) => {
    setPeriods(prev =>
      prev.map(p => (p.id === updatedPeriod.id ? updatedPeriod : p))
    );
    setShowEditarPeriodoModal(false);
    setPeriodToEdit(null);
  };

  const handleToggleShowInactivePeriods = () => {
    setShowInactivePeriods(prev => !prev);
  };

  const handleEditCriteria = (criterion: Criteria) => {
    console.log('Edit criteria:', criterion);
    // Implementar modal de edición de criterios si es necesario
  };

  const handleDeleteCriteria = async (criterion: Criteria) => {
    setDeletingItems(prev => new Set(prev).add(criterion.id));
    try {
      await deactivateCriteria(criterion.id);
      await loadData();
    } catch (error) {
      console.error('Error deactivating criteria:', error);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(criterion.id);
        return newSet;
      });
    }
  };

  const handleReactivateCriteria = async (criterion: Criteria) => {
    setDeletingItems(prev => new Set(prev).add(criterion.id));
    try {
      await reactivateCriteria(criterion.id);
      await loadData();
    } catch (error) {
      console.error('Error reactivating criteria:', error);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(criterion.id);
        return newSet;
      });
    }
  };

  const handleCriteriaCreated = (newCriteria: Criteria) => {
    setCriteria(prev => [...prev, newCriteria]);
    setShowCrearCriterioModal(false);
  };

  const handleToggleShowInactiveCriteria = () => {
    setShowInactiveCriteria(prev => !prev);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Evaluaciones</h1>
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar períodos o criterios..."
          className="border rounded p-2 flex-1"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value as 'todos' | 'productivity' | 'work_conduct' | 'skills')}
          className="border rounded p-2"
        >
          <option value="todos">Todas las categorías</option>
          <option value="productivity">Productividad</option>
          <option value="work_conduct">Conducta Laboral</option>
          <option value="skills">Habilidades</option>
        </select>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showInactivePeriods}
            onChange={handleToggleShowInactivePeriods}
          />
          Mostrar períodos inactivos y finalizados
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showInactiveCriteria}
            onChange={handleToggleShowInactiveCriteria}
          />
          Mostrar criterios inactivos
        </label>
        <button
          onClick={() => setShowCrearCriterioModal(true)}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Crear Criterio
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-2">Períodos</h2>
      <PeriodsSection
        periods={periods}
        searchTerm={searchTerm}
        showInactivePeriods={showInactivePeriods}
        deletingItems={deletingItems}
        onEdit={handleEditPeriod}
        onDelete={handleDeletePeriod}
        onToggleShowExpired={handleToggleShowInactivePeriods}
      />
      <h2 className="text-xl font-semibold mb-2 mt-6">Criterios</h2>
      <CriteriaSection
        criteria={criteria}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        showInactiveCriteria={showInactiveCriteria}
        deletingItems={deletingItems}
        onEdit={handleEditCriteria}
        onDelete={handleDeleteCriteria}
        onReactivate={handleReactivateCriteria}
        onToggleShowInactive={handleToggleShowInactiveCriteria}
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
    </div>
  );
};

export default GestionEvaluacionesPage;