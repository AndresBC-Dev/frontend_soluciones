// src/pages/GestionEvaluacionesPage/components/HeaderSection.tsx

import React from 'react';
import {
  Settings,
  Calendar,
  Target,
  FileCheck,
  Activity,
  CheckCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import StatCard from './StatCard';
import type { Stats } from '../types';

interface HeaderSectionProps {
  stats: Stats;
  categories: string[];
  refreshing: boolean;
  onRefresh: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ 
  stats, 
  categories, 
  refreshing, 
  onRefresh 
}) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Evaluaciones</h1>
          <p className="text-gray-600 mt-1">Administra períodos, criterios, plantillas y evaluaciones</p>
        </div>
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Actualizando...' : 'Actualizar'}
      </button>
    </div>

    {/* Stats Cards - Mantiene el layout horizontal original */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <StatCard
        title="Períodos"
        value={stats.totalPeriods}
        icon={<Calendar className="w-5 h-5" />}
        color="from-blue-500 to-blue-600"
        subtitle={`${stats.activePeriods} activos`}
      />
      <StatCard
        title="Criterios"
        value={stats.totalCriteria}
        icon={<Target className="w-5 h-5" />}
        color="from-green-500 to-green-600"
        subtitle={`${stats.averageWeight}% promedio`}
      />
      <StatCard
        title="Plantillas"
        value={stats.totalTemplates}
        icon={<FileCheck className="w-5 h-5" />}
        color="from-purple-500 to-purple-600"
        subtitle="Disponibles"
      />
      <StatCard
        title="Evaluaciones"
        value={stats.totalEvaluations}
        icon={<Activity className="w-5 h-5" />}
        color="from-orange-500 to-orange-600"
        subtitle="Creadas"
      />
      <StatCard
        title="Categorías"
        value={categories.length - 1}
        icon={<CheckCircle className="w-5 h-5" />}
        color="from-emerald-500 to-emerald-600"
        subtitle="De criterios"
      />
      <StatCard
        title="Total Items"
        value={stats.totalPeriods + stats.totalCriteria + stats.totalTemplates + stats.totalEvaluations}
        icon={<TrendingUp className="w-5 h-5" />}
        color="from-indigo-500 to-indigo-600"
        subtitle="En sistema"
      />
    </div>
  </div>
);

export default HeaderSection;