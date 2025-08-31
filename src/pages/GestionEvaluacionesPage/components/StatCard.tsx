import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  isPercentage?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle, 
  isPercentage 
}) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 bg-gradient-to-r ${color} rounded-lg text-white`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-gray-600 text-xs font-medium">{title}</p>
      <p className="text-xl font-bold text-gray-900">
        {value}{isPercentage ? '%' : ''}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  </div>
);

export default StatCard;