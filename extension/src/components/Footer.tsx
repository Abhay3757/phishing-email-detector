import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1.5" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              PhishGuard AI Email Protection
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center">
              <Info className="h-3.5 w-3.5 mr-1" />
              About
            </button>
            
            <button className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
              Privacy Policy
            </button>
            
            <button className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
              Help & Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;