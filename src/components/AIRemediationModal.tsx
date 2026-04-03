"use client";

import React, { useState } from 'react';
import { X, Code, Shield, AlertTriangle, CheckCircle, Clock, Zap, Brain } from 'lucide-react';

interface AIRemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vulnerability: any;
  language: string;
  framework: string;
}

export default function AIRemediationModal({
  isOpen,
  onClose,
  vulnerability,
  language,
  framework
}: AIRemediationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [remediation, setRemediation] = useState<any>(null);

  const generateRemediation = async () => {
    setIsGenerating(true);
    // Simulate AI remediation generation
    setTimeout(() => {
      setRemediation({
        title: `Fix ${vulnerability?.type || 'Security Issue'}`,
        description: `AI-generated remediation for ${vulnerability?.type || 'security vulnerability'} in ${framework}`,
        steps: [
          'Implement input validation',
          'Add proper sanitization',
          'Update security headers',
          'Test the fix thoroughly'
        ],
        codeExample: `// ${language} example\nfunction secureFunction(input) {\n  // Add validation\n  if (!input || typeof input !== 'string') {\n    throw new Error('Invalid input');\n  }\n  \n  // Sanitize input\n  const sanitized = input.replace(/<script[^>]*>.*?<\\/script>/gi, '');\n  \n  return sanitized;\n}`,
        priority: 'high',
        difficulty: 'medium',
        estimatedTime: '2-4 hours'
      });
      setIsGenerating(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-3xl h-full bg-[#02040b] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 pointer-events-auto overflow-hidden text-white font-sans">
        
        {/* Cinematic Backgrounds */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-[500px] bg-[radial-gradient(circle_at_100%_100%,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="flex justify-between items-center p-6 border-b border-white/10 relative z-10 bg-[#02040b]/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">AI-Powered Remediation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white/60 transition-colors"
          >
            <X className="h-6 w-6 text-white/50 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto h-full space-y-8 pb-32">
          {!remediation ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <Shield className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Generate AI Remediation
                </h3>
                <p className="text-white/60 mb-6">
                  Our AI will analyze the vulnerability and generate a custom fix for your {framework} application.
                </p>
              </div>
              
              <button
                onClick={generateRemediation}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Generate Fix</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {remediation.title}
                </h3>
                <p className="text-white">{remediation.description}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Priority</span>
                  </div>
                  <span className="text-sm text-white/60 capitalize">{remediation.priority}</span>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Code className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Difficulty</span>
                  </div>
                  <span className="text-sm text-white/60 capitalize">{remediation.difficulty}</span>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Time</span>
                  </div>
                  <span className="text-sm text-white/60">{remediation.estimatedTime}</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Implementation Steps</h4>
                <ol className="space-y-2">
                  {remediation.steps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-white/80">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {remediation.codeExample && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Code Example</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{remediation.codeExample}</code>
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setRemediation(null)}
                  className="px-4 py-2 text-white/60 hover:text-white/90 transition-colors"
                >
                  Generate New Fix
                </button>
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
