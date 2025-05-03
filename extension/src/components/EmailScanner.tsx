import React, { useState } from 'react';
import { Mail, Scan, FileSearch } from 'lucide-react';

interface EmailScannerProps {
  onScanEmail: (emailText: string) => void;
  isLoading: boolean;
  error: string;
}

const EmailScanner: React.FC<EmailScannerProps> = ({ 
  onScanEmail, 
  isLoading, 
  error 
}) => {
  const [emailText, setEmailText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScanEmail(emailText);
  };

  const handleScanCurrentEmail = async () => {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Execute script to get email content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
          // Gmail email content is typically in a div with role="textbox"
          const emailContent = document.querySelector('div[role="textbox"]')?.textContent;
          return emailContent || '';
        }
      });

      const emailContent = results[0].result;
      if (emailContent) {
        setEmailText(emailContent);
        onScanEmail(emailContent);
      } else {
        throw new Error('No email content found');
      }
    } catch (err) {
      console.error('Error reading email content:', err);
      setError('Failed to read email content. Make sure you are viewing an email in Gmail.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8 transition-all">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
        <Mail className="h-5 w-5 mr-2 text-blue-500" />
        Email Scanner
      </h2>
      
      <div className="mb-4">
        <button
          onClick={handleScanCurrentEmail}
          disabled={isLoading}
          className="w-full mb-4 flex items-center justify-center px-4 py-2 rounded-md text-white
                   bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                   transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSearch className="mr-2 h-4 w-4" />
          Scan Current Email
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="emailBody" 
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Or Paste Email Content
          </label>
          <textarea
            id="emailBody"
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste the email content here to analyze for phishing attempts..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                      placeholder-slate-400 dark:placeholder-slate-500"
            rows={6}
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                         rounded-md text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 rounded-md text-white
                     bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                     transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <Scan className="mr-2 h-4 w-4" />
              Scan Email
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EmailScanner;