"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Users, Network, Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface ZeroTrustModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export default function ZeroTrustModal({
  isOpen,
  onClose,
  url
}: ZeroTrustModalProps) {
  const [scanResults, setScanResults] = useState<unknown>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      performZeroTrustScan();
    }
  }, [isOpen]);

  const performZeroTrustScan = async () => {
    setIsScanning(true);
    
    // Simulate Zero Trust security scan
    setTimeout(() => {
      setScanResults({
        overallScore: 72,
        grade: 'B',
        principles: [
          {
            principle: 'Verify Explicitly',
            score: 85,
            status: 'compliant',
            description: 'All access requests are verified and validated',
            details: ['Multi-factor authentication implemented', 'Device trust verification active', 'User identity validation in place']
          },
          {
            principle: 'Use Least Privilege Access',
            score: 78,
            status: 'compliant',
            description: 'Users have minimum necessary access permissions',
            details: ['Role-based access control configured', 'Regular access reviews conducted', 'Privileged access management implemented']
          },
          {
            principle: 'Assume Breach',
            score: 65,
            status: 'partial',
            description: 'Security monitoring and incident response capabilities',
            details: ['Security monitoring partially implemented', 'Incident response plan exists', 'Threat detection needs improvement']
          }
        ],
        securityControls: [
          {
            control: 'Identity & Access Management',
            status: 'implemented',
            score: 88,
            details: ['Multi-factor authentication', 'Single sign-on (SSO)', 'Identity governance']
          },
          {
            control: 'Network Security',
            status: 'implemented',
            score: 75,
            details: ['Network segmentation', 'Firewall rules', 'VPN access controls']
          },
          {
            control: 'Data Protection',
            status: 'partial',
            score: 62,
            details: ['Data encryption at rest', 'Data loss prevention', 'Backup and recovery']
          },
          {
            control: 'Device Security',
            status: 'implemented',
            score: 80,
            details: ['Device compliance policies', 'Endpoint protection', 'Mobile device management']
          },
          {
            control: 'Application Security',
            status: 'needs-improvement',
            score: 55,
            details: ['Application security testing', 'Secure development practices', 'API security']
          },
          {
            control: 'Monitoring & Analytics',
            status: 'partial',
            score: 68,
            details: ['Security information and event management', 'User behavior analytics', 'Threat intelligence']
          }
        ],
        recommendations: [
          'Implement comprehensive security monitoring',
          'Enhance application security testing',
          'Improve data protection measures',
          'Strengthen incident response capabilities',
          'Regular security assessments and updates'
        ],
        compliance: {
          nist: 75,
          iso27001: 68,
          soc2: 82,
          pci: 70
        }
      });
      setIsScanning(false);
    }, 3000);
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'partial': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'needs-improvement': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'implemented': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-white/60 border-white/20 bg-white/5';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-cyan-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'principles', label: 'Zero Trust Principles', icon: Lock },
    { id: 'controls', label: 'Security Controls', icon: Network },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-3xl h-full bg-[#02040b] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 pointer-events-auto overflow-hidden text-white font-sans">
        
        {/* Background Cinematic Gradients */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_0%_0%,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-[500px] bg-[radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="flex justify-between items-center p-6 border-b border-white/10 relative z-10 bg-[#02040b]/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl">
              <Lock className="h-5 w-5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">Zero Trust Control Tower</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6 text-white/50 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto h-full space-y-8 pb-32">
          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/20 animate-pulse"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-r-2 border-cyan-400"></div>
                <Lock className="absolute inset-0 m-auto h-6 w-6 text-cyan-400 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Performing Zero Trust Assessment
              </h3>
              <p className="text-white/50 text-sm max-w-sm">
                Authenticating identities, validating device trust, and inspecting access policies...
              </p>
            </div>
          ) : scanResults ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Header Score Card */}
              <div className="p-8 rounded-2xl mb-8 relative overflow-hidden" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">Zero Trust Security Score</h3>
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">{url}</span>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      {scanResults.overallScore}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden backdrop-blur-sm border border-white/5">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000 relative"
                          style={{ width: `${scanResults.overallScore}%` }}
                        >
                          <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/50"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-bold text-white/70 uppercase tracking-widest">
                          Grade: <span className="text-white">{scanResults.grade}</span>
                        </p>
                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                          {scanResults.overallScore >= 80 ? 'Excellent Standard' : scanResults.overallScore >= 60 ? 'Standard Control' : 'Immediate Action Required'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-white/10 mb-8">
                <nav className="flex space-x-8">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`pb-4 px-1 border-b-2 font-bold uppercase tracking-wider text-xs flex items-center space-x-2 transition-all ${
                        activeTab === id
                          ? 'border-cyan-400 text-cyan-400'
                          : 'border-transparent text-white/40 hover:text-white/80 hover:border-white/20'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-96">
                {activeTab === 'overview' && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Security Principles</h4>
                        <div className="space-y-4">
                          {scanResults.principles.map((principle: unknown, index: number) => (
                            <div key={index} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                              <span className="text-sm font-bold text-white/90">{principle.principle}</span>
                              <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest border ${getStatusColor(principle.status)}`}>
                                {principle.score}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Key Recommendations</h4>
                        <ul className="space-y-4">
                          {scanResults.recommendations.slice(0, 3).map((rec: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
                              <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-white/80 leading-relaxed">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'principles' && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    {scanResults.principles.map((principle: unknown, index: number) => (
                      <div key={index} className="p-6 rounded-2xl transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-lg text-white">{principle.principle}</h4>
                          <div className="flex items-center space-x-4">
                            <span className={`text-xl font-black ${getScoreColor(principle.score)}`}>
                              {principle.score}%
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(principle.status)}`}>
                              {principle.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-white/60 text-sm mb-6 pb-6 border-b border-white/5">{principle.description}</p>
                        <div className="space-y-3">
                          {principle.details.map((detail: string, detailIndex: number) => (
                            <div key={detailIndex} className="flex items-center space-x-3">
                              <CheckCircle className="h-4 w-4 text-cyan-400/80" />
                              <span className="text-sm font-medium text-white/70">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'controls' && (
                  <div className="grid md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                    {scanResults.securityControls.map((control: unknown, index: number) => (
                      <div key={index} className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/5">
                          <h4 className="font-bold text-white text-sm max-w-[150px] leading-tight">{control.control}</h4>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`text-xl font-black leading-none ${getScoreColor(control.score)}`}>
                              {control.score}%
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusColor(control.status)}`}>
                              {control.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {control.details.map((detail: string, detailIndex: number) => (
                            <div key={detailIndex} className="flex items-start space-x-3">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-white/60 leading-relaxed font-medium">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'compliance' && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(scanResults.compliance).map(([standard, score]: [string, any]) => (
                        <div key={standard} className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white tracking-widest uppercase">{standard}</h4>
                            <span className={`text-2xl font-black ${getScoreColor(score)}`}>
                              {score}%
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                score >= 80 ? 'bg-cyan-400' : score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${score}%`, boxShadow: score >= 80 ? '0 0 10px rgba(34,211,238,0.5)' : 'none' }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#02040b]/90 backdrop-blur-xl border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 font-bold uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(6,182,212,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
