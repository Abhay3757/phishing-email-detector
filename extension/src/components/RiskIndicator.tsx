import React from 'react';

interface RiskIndicatorProps {
  level: string;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ level }) => {
  let color = '';
  let label = '';
  
  switch (level.toLowerCase()) {
    case 'high':
      color = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      label = 'High Risk';
      break;
    case 'medium':
      color = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      label = 'Medium Risk';
      break;
    case 'low':
      color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      label = 'Low Risk';
      break;
    default:
      color = 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
      label = 'Unknown Risk';
  }

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${color}`}>
      {label}
    </span>
  );
};

export default RiskIndicator;