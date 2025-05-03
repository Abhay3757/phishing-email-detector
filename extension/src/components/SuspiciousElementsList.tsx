import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SuspiciousElementsListProps {
  elements: string[];
}

const SuspiciousElementsList: React.FC<SuspiciousElementsListProps> = ({ elements }) => {
  if (!elements || elements.length === 0) {
    return (
      <div className="rounded-md bg-slate-50 dark:bg-slate-700/30 p-3">
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          No suspicious elements detected
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {elements.map((element, index) => (
        <li 
          key={index}
          className="flex items-start py-2 px-3 bg-amber-50 dark:bg-amber-900/10 
                   border border-amber-100 dark:border-amber-800/30 rounded-md"
        >
          <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm text-amber-800 dark:text-amber-200">{element}</span>
        </li>
      ))}
    </ul>
  );
};

export default SuspiciousElementsList;