import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import Header from './components/Header';
import EmailScanner from './components/EmailScanner';
import AnalysisResults from './components/AnalysisResults';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [emailBody, setEmailBody] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScanEmail = async (emailText: string) => {
    setError('');
    setIsLoading(true);
    
    try {
      if (!emailText.trim()) {
        throw new Error('Please provide email content to scan');
      }
  
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_body: emailText }),
      });
  
      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
      }
  
      const data = await response.json();
      setAnalysisResults(data);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while scanning the email');
      setAnalysisResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                AI Email Phishing Detector
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Protect yourself from phishing attacks with AI-powered analysis
              </p>
            </div>

            <EmailScanner 
              onScanEmail={handleScanEmail} 
              isLoading={isLoading} 
              error={error}
            />

            {analysisResults && (
              <AnalysisResults results={analysisResults} emailBody={emailBody} />
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;