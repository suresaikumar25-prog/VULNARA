"use client";

import React, { useState, useEffect } from "react";
import { Shield, Search, FileText, AlertTriangle, CheckCircle, Clock, Globe, History, Trash2, LogOut, User, Calendar, BarChart3, Brain, Zap, Wrench, Code, Target, Activity, TrendingUp, Lock, Rocket, Menu, X as XIcon, Download, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseService } from "@/lib/supabaseService";
import { RouteGuard } from "@/components/RouteGuard";
import ScheduledScans from "@/components/ScheduledScans";
import ComparisonReport from "@/components/ComparisonReport";
import AIRemediationModal from "@/components/AIRemediationModal";
import ContextualRiskModal from "@/components/ContextualRiskModal";
import ThreatIntelligenceModal from "@/components/ThreatIntelligenceModal";
import PredictiveAnalyticsModal from "@/components/PredictiveAnalyticsModal";
import ZeroTrustModal from "@/components/ZeroTrustModal";
import AdvancedSecurityModal from "@/components/AdvancedSecurityModal";

/* ════════════════════════════════════════════════
   ThreatLens Premium Navbar Component
   ════════════════════════════════════════════════ */
interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: 'scan' | 'history' | 'scheduled') => void;
  scanHistoryCount: number;
  userEmail: string;
  onLogout: () => void;
}

function ThreatLensNavbar({ activeTab, setActiveTab, scanHistoryCount, userEmail, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'scan' as const,      label: 'Scan',      Icon: Search,   badge: null },
    { id: 'history' as const,   label: 'History',   Icon: History,  badge: scanHistoryCount > 0 ? scanHistoryCount : null },
    { id: 'scheduled' as const, label: 'Scheduled', Icon: Calendar,  badge: null },
  ];

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 18px',
    borderRadius: '20px',
    fontSize: '13.5px',
    fontWeight: active ? 700 : 600,
    fontFamily: 'var(--font-outfit), "Outfit", "DM Sans", sans-serif',
    letterSpacing: '-0.01em',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    background: 'transparent',
    color: active ? '#ffffff' : 'rgba(186,215,255,0.55)',
    boxShadow: 'none',
    whiteSpace: 'nowrap' as 'nowrap',
    position: 'relative' as 'relative',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .tn-nav-ghost:hover {
          background: rgba(59,130,246,0.08) !important;
          color: rgba(219,234,254,0.9) !important;
          border-color: rgba(59,130,246,0.2) !important;
        }
        .tn-logout:hover {
          background: rgba(239,68,68,0.12) !important;
          border-color: rgba(239,68,68,0.45) !important;
          color: #fca5a5 !important;
          transform: translateY(-1px);
        }
        .tn-mobile-item:hover {
          background: rgba(59,130,246,0.1) !important;
        }
      `}</style>

      <header style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        fontFamily: 'var(--font-outfit), "Outfit", "DM Sans", sans-serif',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* ── LEFT: Logo ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Square-outline shield icon */}
            <div style={{
              width: 36, height: 36,
              border: '2px solid #3b82f6',
              borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(59,130,246,0.3), inset 0 0 8px rgba(59,130,246,0.08)',
              flexShrink: 0,
            }}>
              <Shield style={{ width: 18, height: 18, color: '#3b82f6' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{
                fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
                fontWeight: 800,
                fontSize: '17px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>ThreatLens</span>
              <span style={{
                fontSize: '8.5px',
                letterSpacing: '0.2em',
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginTop: '2px',
              }}>SECURITY SUITE</span>
            </div>
          </div>

          {/* ── CENTER: Nav (desktop) ── */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '5px',
          }} className="hidden-mobile">
            {navItems.map(({ id, label, Icon, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  ...navBtnStyle(activeTab === id),
                  color: activeTab === id ? '#ffffff' : '#64748b',
                }}
                className={activeTab !== id ? 'tn-nav-ghost-light' : 'bg-blue-600'}
              >
                <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>{label}</span>
                {badge !== null && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    borderRadius: '9px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: activeTab === id ? 'rgba(255,255,255,0.2)' : '#dbeafe',
                    color: activeTab === id ? '#fff' : '#1e40af',
                    border: activeTab === id ? '1px solid rgba(255,255,255,0.3)' : '1px solid #bfdbfe',
                  }}>{badge}</span>
                )}
              </button>
            ))}
          </nav>

          {/* ── RIGHT: Avatar + Logout + Hamburger ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Email + Circular Avatar — hidden on mobile */}
            {userEmail && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 12px 5px 5px',
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.12)',
                borderRadius: '24px',
              }} className="hidden-mobile">
                {/* Circular avatar with blue ring */}
                <div style={{
                  width: 30, height: 30,
                  borderRadius: '50%',
                  background: 'rgba(15,23,42,0.9)',
                  border: '2px solid #3b82f6',
                  boxShadow: '0 0 12px rgba(59,130,246,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <User style={{ width: 14, height: 14, color: '#60a5fa' }} />
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(148,187,234,0.75)',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                }}>{userEmail}</span>
              </div>
            )}

            {/* Logout button — outline + red on hover */}
            <button
              onClick={onLogout}
              className="tn-logout hidden-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: 'transparent',
                border: '1px solid rgba(100,116,139,0.35)',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'rgba(148,163,184,0.8)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
            >
              <LogOut style={{ width: 13, height: 13 }} />
              <span>Logout</span>
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="show-mobile"
              style={{
                display: 'none',
                padding: '7px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '9px',
                color: 'rgba(186,215,255,0.7)',
                cursor: 'pointer',
              }}
            >
              {mobileOpen ? <XIcon style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid rgba(37,99,235,0.15)',
            background: 'rgba(11,15,26,0.98)',
            padding: '12px 24px 16px',
          }}>
            {navItems.map(({ id, label, Icon, badge }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setMobileOpen(false); }}
                className="tn-mobile-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: activeTab === id ? 'rgba(37,99,235,0.15)' : 'transparent',
                  border: 'none',
                  color: activeTab === id ? '#93c5fd' : 'rgba(148,187,234,0.65)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  marginBottom: '2px',
                }}
              >
                <Icon style={{ width: 15, height: 15 }} />
                <span>{label}</span>
                {badge !== null && (
                  <span style={{
                    marginLeft: 'auto',
                    minWidth: '20px',
                    height: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: 'rgba(59,130,246,0.2)',
                    color: '#93c5fd',
                    border: '1px solid rgba(59,130,246,0.3)',
                    padding: '0 6px',
                  }}>{badge}</span>
                )}
              </button>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '10px', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(15,23,42,0.9)', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User style={{ width: 12, height: 12, color: '#60a5fa' }} />
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(148,187,234,0.65)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</span>
              </div>
              <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <LogOut style={{ width: 12, height: 12 }} /><span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Responsive helper styles */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}

interface ScanResult {
  id: string;
  url: string;
  timestamp: Date;
  status: 'scanning' | 'completed' | 'error';
  vulnerabilities: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
    remediation?: {
      title: string;
      description: string;
      steps: string[];
      codeExample?: string;
      priority: 'high' | 'medium' | 'low';
      difficulty: 'easy' | 'medium' | 'hard';
      estimatedTime: string;
    };
  }[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  securityScore: {
    score: number;
    grade: string;
    color: string;
    description: string;
  };
  certificateInfo?: {
    isValid: boolean;
    issuer: string;
    validFrom: string;
    validTo: string;
    daysUntilExpiry: number;
    keySize: number;
    algorithm: string;
  };
  phishingDetection?: {
    is_phishing: boolean;
    confidence: number;
    probability: number;
    risk_level: string;
  };
}

export default function DashboardView() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [phishingResult, setPhishingResult] = useState<{
    is_phishing: boolean;
    confidence: number;
    probability: number;
    risk_level: string;
    indicators?: any[];
    suspicious_elements?: string[];
    legitimate_elements?: string[];
    recommendations?: string[];
    ai_insights?: any;
    technical_details?: any;
  } | null>(null);

  useEffect(() => {
    console.log('🔄 Phishing result state changed:', phishingResult);
  }, [phishingResult]);

  const [isAnalyzingPhishing, setIsAnalyzingPhishing] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'scheduled'>('scan');
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonUrl, setComparisonUrl] = useState('');
  const [selectedScans, setSelectedScans] = useState<string[]>([]);
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    isLive: boolean;
    error?: string;
    isValidating: boolean;
  }>({ isValid: false, isLive: false, isValidating: false });
  const [showAIRemediation, setShowAIRemediation] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState<any>(null);
  const [showContextualRisk, setShowContextualRisk] = useState(false);
  const [selectedRiskVulnerability, setSelectedRiskVulnerability] = useState<any>(null);
  const [showThreatIntelligence, setShowThreatIntelligence] = useState(false);
  const [selectedThreatVulnerability, setSelectedThreatVulnerability] = useState<any>(null);
  const [showPredictiveAnalytics, setShowPredictiveAnalytics] = useState(false);
  const [showZeroTrustScan, setShowZeroTrustScan] = useState(false);
  const [showAdvancedSecurity, setShowAdvancedSecurity] = useState(false);
  
  useEffect(() => {
    console.log('🔍 showAdvancedSecurity changed:', showAdvancedSecurity);
  }, [showAdvancedSecurity]);

  const { user, logout } = useAuth();

  useEffect(() => {
    if (showAdvancedSecurity) return;
    
    const loadScanHistory = async () => {
      if (user) {
        try {
          const history = await SupabaseService.getScanResults(user.uid);
          const formattedHistory = history.map((scan: any) => ({
            ...scan,
            timestamp: new Date(scan.timestamp)
          }));
          setScanHistory(formattedHistory);
        } catch (error) {
          console.error('Error loading scan history:', error);
        }
      }
    };
    loadScanHistory();
  }, [user, showAdvancedSecurity]);

  useEffect(() => {
    if (showAdvancedSecurity) return;
    if (typeof window !== 'undefined' && scanHistory.length > 0) {
      localStorage.setItem('threatlens-scan-history', JSON.stringify(scanHistory));
    }
  }, [scanHistory, showAdvancedSecurity]);

  useEffect(() => {
    if (showAdvancedSecurity) return;
    if (!url) {
      setUrlValidation({ isValid: false, isLive: false, isValidating: false });
      return;
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      const urlObj = new URL(normalizedUrl);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setUrlValidation({ isValid: false, isLive: false, error: 'URL must use HTTP or HTTPS protocol', isValidating: false });
        return;
      }
    } catch {
      setUrlValidation({ isValid: false, isLive: false, error: 'Invalid URL format', isValidating: false });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUrlValidation(prev => ({ ...prev, isValidating: true }));
      try {
        const response = await fetch('/api/validate-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: normalizedUrl })
        });
        const result = await response.json();
        setUrlValidation({ isValid: result.isValid, isLive: result.isLive, error: result.error, isValidating: false });
      } catch (error) {
        setUrlValidation({ isValid: false, isLive: false, error: 'Unable to validate URL', isValidating: false });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [url, showAdvancedSecurity]);

  const handleScan = async () => {
    if (!url) return;
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) normalizedUrl = 'https://' + normalizedUrl;
    
    setIsScanning(true);
    const scanId = Math.random().toString(36).substring(2, 9);
    const newScan: ScanResult = {
      id: scanId,
      url: normalizedUrl,
      timestamp: new Date(),
      status: 'scanning',
      vulnerabilities: [],
      summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
      securityScore: { score: 0, grade: 'N/A', color: 'gray', description: 'Validating URL...' }
    };
    setScanResults(prev => [newScan, ...prev]);
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl })
      });
      if (!response.ok) throw new Error('Scan failed');
      const result = await response.json();
      const completedScan = { ...newScan, ...result, status: 'completed' as const };
      setScanResults(prev => prev.map(scan => scan.id === newScan.id ? completedScan : scan));
      if (user) {
        await SupabaseService.saveScanResult({
          user_id: user.uid,
          url: completedScan.url,
          timestamp: completedScan.timestamp.toISOString(),
          vulnerabilities: completedScan.vulnerabilities,
          summary: completedScan.summary,
          security_score: completedScan.securityScore,
          certificate_info: completedScan.certificateInfo
        });

        // ── Email scan results to the signed-in user ──────────────────
        if (user.email) {
          fetch('/api/send-scan-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail: user.email,
              url: completedScan.url,
              score: completedScan.securityScore.score,
              grade: completedScan.securityScore.grade,
              assessment: completedScan.securityScore.description,
              scannedAt: completedScan.timestamp.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }),
              risks: completedScan.vulnerabilities.map((v: { severity: string; type: string; description: string }) => ({
                severity: v.severity,
                title: v.type,
                description: v.description,
              })),
            }),
          }).catch((err) => console.warn('[send-scan-report] email failed:', err));
        }
      }
      setScanHistory(prev => [completedScan, ...prev.slice(0, 49)]);
    } catch (error) {
      setScanResults(prev => prev.map(scan => scan.id === newScan.id ? { ...scan, status: 'error' as const, securityScore: { score: 0, grade: 'ERROR', color: 'red', description: 'Scan failed' } } : scan));
    } finally {
      setIsScanning(false);
    }
  };

  const analyzePhishing = async () => {
    if (!url.trim()) return;
    setIsAnalyzingPhishing(true);
    setPhishingResult(null);

    try {
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) normalizedUrl = 'https://' + normalizedUrl;
      const response = await fetch('/api/phishing-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl })
      });
      const result = await response.json();
      
      // Handle the case where the API is successful, or it fell back (handles both format types just in case)
      if (result.success && result.data) {
        const data = result.data;
        setPhishingResult({
          is_phishing: data.is_phishing ?? data.isPhishing ?? false,
          confidence: data.confidence ?? 0,
          probability: data.probability ?? data.riskScore ?? 0,
          risk_level: data.risk_level ?? data.riskLevel ?? 'Unknown',
          indicators: data.indicators || [],
          suspicious_elements: data.suspicious_elements || data.suspiciousElements || [],
          legitimate_elements: data.legitimate_elements || data.legitimateElements || [],
          recommendations: data.recommendations || [],
          ai_insights: data.ai_insights || data.aiInsights || null,
          technical_details: data.technical_details || data.technicalDetails || null
        });
      } else if (result.fallback || result.analysis) {
        const data = result.fallback || result.analysis;
        setPhishingResult({
          is_phishing: data.is_phishing ?? data.isPhishing ?? false,
          confidence: data.confidence ?? 0,
          probability: data.probability ?? data.riskScore ?? 0,
          risk_level: data.risk_level ?? data.riskLevel ?? 'Unknown'
        });
      } else {
        // Ultimate fallback
        setPhishingResult({
          is_phishing: false,
          confidence: 0,
          probability: 0,
          risk_level: 'Unknown'  
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzingPhishing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleScanSelection = (scanId: string, isSelected: boolean) => {
    if (isSelected) setSelectedScans(prev => [...prev, scanId]);
    else setSelectedScans(prev => prev.filter(id => id !== scanId));
  };

  const handleCompareScans = (url: string) => {
    setComparisonUrl(url);
    setShowComparison(true);
  };

  const closeComparison = () => {
    setShowComparison(false);
    setSelectedScans([]);
    setComparisonUrl('');
  };

  const generateReport = async (scan: ScanResult) => {
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: scan.url,
          timestamp: scan.timestamp.toISOString(),
          vulnerabilities: scan.vulnerabilities,
          summary: scan.summary,
          securityScore: scan.securityScore,
          certificateInfo: scan.certificateInfo
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report.pdf`;
        a.click();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteScanFromHistory = async (scanId: string) => {
    if (user) {
      await SupabaseService.deleteScanResult(scanId, user.uid);
      setScanHistory(prev => prev.filter(scan => scan.id !== scanId));
    }
  };

  const loadScanFromHistory = (scan: ScanResult) => {
    setScanResults(prev => [scan, ...prev]);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <RouteGuard>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        @keyframes glow-pulse-intense-white {
          0%, 100% {
            text-shadow:
              0 0 10px rgba(255,255,255,0.8),
              0 0 20px rgba(255,255,255,0.6),
              0 0 40px rgba(255,255,255,0.4),
              0 0 80px rgba(255,255,255,0.2);
          }
          50% {
            text-shadow:
              0 0 15px rgba(255,255,255,1),
              0 0 30px rgba(255,255,255,0.8),
              0 0 60px rgba(255,255,255,0.5),
              0 0 120px rgba(255,255,255,0.3);
          }
        }
        @keyframes glow-pulse-white {
          0%, 100% {
            text-shadow:
              0 0 8px rgba(255,255,255,0.3),
              0 0 20px rgba(255,255,255,0.2);
          }
          50% {
            text-shadow:
              0 0 15px rgba(255,255,255,0.5),
              0 0 35px rgba(255,255,255,0.3);
          }
        }
        @keyframes glow-blue {
          0%, 100% { text-shadow: 0 0 8px rgba(59,130,246,0.5), 0 0 20px rgba(59,130,246,0.25); }
          50% { text-shadow: 0 0 16px rgba(59,130,246,0.85), 0 0 35px rgba(59,130,246,0.4); }
        }
        @keyframes glow-purple {
          0%, 100% { text-shadow: 0 0 8px rgba(168,85,247,0.6), 0 0 20px rgba(168,85,247,0.3); }
          50% { text-shadow: 0 0 16px rgba(168,85,247,0.95), 0 0 40px rgba(168,85,247,0.45); }
        }
        @keyframes shimmer-text {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        /* Main hero heading — subtle white glow on parent */
        .glow-heading {
          color: #ffffff;
          animation: glow-pulse-white 4s ease-in-out infinite;
          letter-spacing: 0.06em;
        }
        /* Intense white accent */
        .glow-cyan {
          color: #ffffff;
          animation: glow-pulse-intense-white 2.8s ease-in-out infinite;
        }
        .glow-blue-text {
          animation: glow-blue 3s ease-in-out infinite;
        }
        .glow-purple-text {
          animation: glow-purple 3s ease-in-out infinite;
        }
        .glow-label {
          color: #ffffff;
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
          letter-spacing: 0.18em;
        }
        .glow-section-title {
          background: linear-gradient(90deg, #ffffff 0%, #e2e8f0 40%, #ffffff 60%, #e2e8f0 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 4s linear infinite;
        }
      `}</style>
      <div className="dashboard min-h-screen relative font-sans text-slate-800 overflow-hidden" style={{ background: '#f8fafc' }}>
        {/* Background Cinematic Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.08),transparent_70%)]" />
          <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.05),transparent_70%)]" />
        </div>

        {/* Grid Pattern Background */}
        <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

        <div className="relative z-10">
          {/* ─── ThreatLens Premium Navbar ─── */}
          <ThreatLensNavbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            scanHistoryCount={scanHistory.length}
            userEmail={user?.email || ''}
            onLogout={handleLogout}
          />
      <main style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {activeTab === 'scan' && (
          <>
            <div className="text-center mb-12">
              <h2
                className="text-4xl lg:text-5xl font-black tracking-tight mb-4"
                style={{ fontFamily: 'var(--font-outfit), "Outfit", sans-serif', color: '#0f172a' }}
              >
                SECURE YOUR{' '}<span style={{ color: '#0ea5e9' }}>WEB APPLICATIONS</span>
              </h2>
              <p
                className="text-lg mb-8 max-w-3xl mx-auto font-medium"
                style={{
                  color: '#475569',
                  lineHeight: 1.7,
                }}
              >
                Deep-learning vulnerability scanning for modern engineering teams. Detect SQLi, XSS, and misconfigurations with an AI-first security engine.
              </p>
            </div>

            <div className="p-8 mb-8 rounded-2xl transition-all duration-300"
                 style={{
                   background: 'rgba(255,255,255,0.02)',
                   border: '1px solid rgba(255,255,255,0.06)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                 }}>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label htmlFor="url" className="block text-xs font-bold uppercase mb-3 glow-label">Website URL / IP</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500/40 group-focus-within:text-cyan-400 transition-colors duration-300" />
                    <input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com"
                           className="w-full pl-12 pr-12 py-4 bg-black/40 text-white placeholder-white/20 outline-none transition-all font-mono text-sm rounded-xl"
                           style={{
                             border: `1px solid ${urlValidation.isValidating ? 'rgba(234,179,8,0.4)' : urlValidation.isValid && urlValidation.isLive ? 'rgba(16,185,129,0.4)' : url && !urlValidation.isValid ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                             boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                           }}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {urlValidation.isValidating ? (<Clock className="h-5 w-5 text-yellow-500 animate-spin" />) : urlValidation.isValid && urlValidation.isLive ? (<div className="h-5 w-5 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center"><CheckCircle className="h-3 w-3 text-green-400" /></div>) : url && !urlValidation.isValid ? (<div className="h-5 w-5 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center"><XIcon className="h-3 w-3 text-red-400" /></div>) : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center lg:items-start gap-4 lg:mt-[34px]">
                  <button onClick={handleScan} disabled={!url || isScanning || !urlValidation.isValid || !urlValidation.isLive}
                          className="px-6 py-4 font-bold uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed group hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                            color: '#fff',
                            boxShadow: '0 4px 20px rgba(6,182,212,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                            border: 'none',
                          }}>
                    {isScanning ? (<><Clock className="h-4 w-4 animate-spin" /><span>Scanning...</span></>) : (<><Search className="h-4 w-4 group-hover:rotate-12 transition-transform" /><span>Start Scan</span></>)}
                  </button>

                  <button onClick={analyzePhishing} disabled={!url || isAnalyzingPhishing}
                          className="px-5 py-4 font-bold uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed group hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: 'rgba(168,85,247,0.1)',
                            color: '#e879f9',
                            border: '1px solid rgba(168,85,247,0.3)',
                          }}>
                    {isAnalyzingPhishing ? (<><Brain className="h-4 w-4 animate-pulse" /><span>Analyzing...</span></>) : (<><Brain className="h-4 w-4 group-hover:scale-110 transition-transform" /><span>AI Phish Check</span></>)}
                  </button>

                  <button onClick={() => setShowZeroTrustScan(true)} disabled={!url}
                          className="px-5 py-4 font-bold uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed group hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: 'rgba(59,130,246,0.1)',
                            color: '#93c5fd',
                            border: '1px solid rgba(59,130,246,0.3)',
                          }}>
                    <Lock className="h-4 w-4 group-hover:-rotate-12 transition-transform" /><span>Zero-Trust</span>
                  </button>

                  <button onClick={() => setShowAdvancedSecurity(true)} disabled={!url}
                          className="px-5 py-4 font-bold uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed group hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(244,63,94,0.1) 100%)',
                            color: '#fb7185',
                            border: '1px solid rgba(244,63,94,0.3)',
                          }}>
                    <Rocket className="h-4 w-4 group-hover:-translate-y-1 transition-transform" /><span>Advanced</span>
                  </button>
                </div>
              </div>
            </div>

            {scanResults.length > 0 && (
              <div className="space-y-6">
                {scanResults.map((scan) => (
                  <div key={scan.id} className="p-6 rounded-2xl"
                       style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-bold tracking-tight text-slate-800">{scan.url}</h4>
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${scan.status === 'completed' ? 'bg-green-500/10 text-green-700 border border-green-500/30' : scan.status === 'error' ? 'bg-red-500/10 text-red-700 border border-red-500/30' : 'bg-cyan-500/10 text-cyan-700 border border-cyan-500/30'}`}>
                          {scan.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{scan.timestamp.toLocaleString()}</div>
                    </div>

                    {scan.status === 'completed' && (
                      <>
                        <div className="mb-6">
                          <div className={`relative overflow-hidden flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-6 rounded-xl border`}
                               style={{
                                  background: scan.securityScore.color === 'green' ? 'rgba(16,185,129,0.05)' : scan.securityScore.color === 'red' ? 'rgba(239,68,68,0.05)' : scan.securityScore.color === 'orange' ? 'rgba(249,115,22,0.05)' : 'rgba(59,130,246,0.05)',
                                  borderColor: scan.securityScore.color === 'green' ? 'rgba(16,185,129,0.2)' : scan.securityScore.color === 'red' ? 'rgba(239,68,68,0.2)' : scan.securityScore.color === 'orange' ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)',
                               }}>
                            <div className="text-center shrink-0">
                              <div className="text-5xl font-black" style={{ color: scan.securityScore.color === 'green' ? '#059669' : scan.securityScore.color === 'red' ? '#dc2626' : scan.securityScore.color === 'orange' ? '#d97706' : '#2563eb' }}>{scan.securityScore.score}</div>
                              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Score</div>
                            </div>
                            <div className="text-center shrink-0">
                              <div className="text-4xl font-black text-slate-800">{scan.securityScore.grade}</div>
                              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Grade</div>
                            </div>
                            <div className="flex-1 text-center sm:text-left z-10 relative">
                              <div className="text-lg font-bold mb-1 text-slate-800">Security Assessment</div>
                              <div className="text-sm text-slate-600 font-medium">{scan.securityScore.description}</div>
                            </div>
                            <Shield className={`absolute right-[-20px] bottom-[-20px] h-32 w-32 opacity-10 ${scan.securityScore.color === 'green' ? 'text-emerald-500' : 'text-blue-500'}`} />
                          </div>
                        </div>

                        {scan.vulnerabilities.length > 0 ? (
                           <div className="space-y-4">
                             <h5 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Identified Risks</h5>
                             <div className="space-y-3">
                               {scan.vulnerabilities.map((vuln, index) => (
                                 <div key={index} className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all"
                                      style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                                   <div className="flex-1">
                                     <div className="flex items-center space-x-3 mb-2">
                                       <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${vuln.severity === 'critical' ? 'bg-red-500/10 text-red-700 border border-red-500/30' : vuln.severity === 'high' ? 'bg-orange-500/10 text-orange-700 border border-orange-500/30' : vuln.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/30' : 'bg-cyan-500/10 text-cyan-700 border border-cyan-500/30'}`}>
                                         {vuln.severity}
                                       </span>
                                       {(vuln as any)?.category && (
                                         <span className={`px-2.5 py-1 text-[10px] font-bold tracking-widest rounded-md bg-white border border-slate-200 text-slate-600`}>
                                           {(vuln as any).category}
                                         </span>
                                       )}
                                     </div>
                                     <h6 className="font-bold text-slate-800 mb-2">{vuln.type}</h6>
                                     <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">{vuln.description}</p>
                                     <div className="flex flex-wrap gap-3">
                                       <button onClick={() => { setSelectedRiskVulnerability({ ...vuln, url: scan.url }); setShowContextualRisk(true); }} className="px-4 py-2 text-xs font-bold rounded-lg text-white transition-all hover:-translate-y-0.5" style={{ background: '#e0f2fe', border: '1px solid #7dd3fc', color: '#0369a1' }}>Evaluate Context</button>
                                       <button onClick={() => { setSelectedVulnerability({ ...vuln, url: scan.url }); setShowAIRemediation(true); }} className="px-4 py-2 text-xs font-bold rounded-lg transition-all hover:-translate-y-0.5" style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', color: '#7e22ce' }}>AI Remediation</button>
                                       <button onClick={() => { setSelectedThreatVulnerability({ ...vuln, url: scan.url }); setShowThreatIntelligence(true); }} className="px-4 py-2 text-xs font-bold rounded-lg transition-all hover:-translate-y-0.5" style={{ background: '#dbeafe', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>Threat Intel</button>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                        ) : (
                          <div className="p-8 rounded-xl border flex flex-col items-center justify-center text-center mt-6" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                            <CheckCircle className="h-10 w-10 text-emerald-500 mb-3" />
                            <h5 className="font-bold text-emerald-900 mb-1">No Immediate Targets Identified</h5>
                            <p className="text-sm text-emerald-700/80">The primary scans did not reveal critical vulnerabilities.</p>
                          </div>
                        )}

                        <div className="mt-8 flex justify-end space-x-4 border-t pt-6" style={{ borderColor: '#f1f5f9' }}>
                          <button
                            onClick={() => generateReport(scan)}
                            className="flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5"
                            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                          >
                            <FileText className="h-4 w-4" />
                            <span>Download Full Report (.PDF)</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {phishingResult && (
              <div className="mt-8 p-6 rounded-2xl border-l-[3px]"
                   style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeftColor: '#a855f7', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <h4 className="text-xl font-bold" style={{ color: '#0f172a' }}>Deep-Intelligence Phishing Analysis</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border ${phishingResult.is_phishing ? 'bg-red-500/10 text-red-700 border-red-500/30' : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'}`}>
                    {phishingResult.is_phishing ? '⚠️ Threat Detected' : '✅ Verified Safe'}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                  <div className="p-5 rounded-xl border flex flex-col items-center justify-center text-center" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-3xl font-black text-slate-800">{phishingResult.confidence}%</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">AI Confidence</div>
                  </div>
                  <div className="p-5 rounded-xl border flex flex-col items-center justify-center text-center" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="text-3xl font-black text-slate-800">{phishingResult.probability}%</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Risk Logic</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            {/* ── Header Row ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 32px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 38, height: 38,
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
                }}>
                  <History style={{ width: 18, height: 18, color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: 'var(--font-outfit), sans-serif', letterSpacing: '-0.02em' }}>Scan History</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginTop: '2px' }}>{scanHistory.length} scan{scanHistory.length !== 1 ? 's' : ''} recorded</p>
                </div>
              </div>

              {/* ── Premium Download Button ── */}
              {scanHistory.length > 0 && (
                <button
                  onClick={() => {
                    const rows = [
                      ['URL', 'Status', 'Score', 'Grade', 'Vulnerabilities', 'Timestamp'],
                      ...scanHistory.map(s => [
                        s.url,
                        s.status,
                        s.securityScore?.score ?? 'N/A',
                        s.securityScore?.grade ?? 'N/A',
                        s.vulnerabilities?.length ?? 0,
                        s.timestamp.toLocaleString(),
                      ])
                    ];
                    const csv = rows.map(r => r.map(String).map(v => `"${v.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `threatlens-history-${new Date().toISOString().slice(0,10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-outfit), sans-serif',
                    letterSpacing: '-0.01em',
                    boxShadow: '0 0 0 2px #ffffff, 0 0 0 4px rgba(37,99,235,0.5), 0 4px 16px rgba(37,99,235,0.35)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px #ffffff, 0 0 0 5px rgba(37,99,235,0.6), 0 8px 24px rgba(37,99,235,0.45)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px #ffffff, 0 0 0 4px rgba(37,99,235,0.5), 0 4px 16px rgba(37,99,235,0.35)';
                  }}
                >
                  <Download style={{ width: 15, height: 15 }} />
                  <span>Download CSV</span>
                </button>
              )}
            </div>

            {/* ── History List ── */}
            <div style={{ padding: '16px 24px 24px' }}>
              {scanHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: 56, height: 56, background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <History style={{ width: 26, height: 26, color: '#3b82f6' }} />
                  </div>
                  <p style={{ color: '#475569', fontSize: '15px', fontWeight: 500, margin: 0 }}>No scans recorded yet</p>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: '6px 0 0' }}>Run your first scan to see results here</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {scanHistory.map((scan, idx) => (
                    <div
                      key={scan.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.18s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#93c5fd'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                    >
                      {/* Left: URL + timestamp */}
                      <div style={{ flex: 1, minWidth: 0, marginRight: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Globe style={{ width: 13, height: 13, color: '#0ea5e9', flexShrink: 0 }} />
                          <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.url}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                          <Clock style={{ width: 10, height: 10, display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                          {scan.timestamp.toLocaleString()}
                        </span>
                      </div>

                      {/* Center: Score + Status + Vuln count */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {scan.securityScore && (
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: scan.securityScore.score >= 80 ? 'rgba(16,185,129,0.1)' : scan.securityScore.score >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            color: scan.securityScore.score >= 80 ? '#059669' : scan.securityScore.score >= 50 ? '#d97706' : '#dc2626',
                            border: `1px solid ${scan.securityScore.score >= 80 ? 'rgba(16,185,129,0.25)' : scan.securityScore.score >= 50 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
                          }}>
                            {scan.securityScore.grade} · {scan.securityScore.score}
                          </span>
                        )}
                        {scan.vulnerabilities?.length > 0 && (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                            {scan.vulnerabilities.length} vuln{scan.vulnerabilities.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                          background: scan.status === 'completed' ? 'rgba(16,185,129,0.08)' : scan.status === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)',
                          color: scan.status === 'completed' ? '#059669' : scan.status === 'error' ? '#dc2626' : '#2563eb',
                          border: `1px solid ${scan.status === 'completed' ? 'rgba(16,185,129,0.2)' : scan.status === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
                        }}>
                          {scan.status}
                        </span>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '16px', flexShrink: 0 }}>
                        <button
                          onClick={() => loadScanFromHistory(scan)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 12px',
                            background: 'rgba(59,130,246,0.08)',
                            border: '1px solid rgba(59,130,246,0.2)',
                            borderRadius: '8px',
                            color: '#2563eb',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.15)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.08)'; }}
                        >
                          <span>View</span>
                          <ChevronRight style={{ width: 12, height: 12 }} />
                        </button>
                        <button
                          onClick={() => {
                            const rows = [
                              ['Field', 'Value'],
                              ['URL', scan.url],
                              ['Status', scan.status],
                              ['Score', scan.securityScore?.score ?? 'N/A'],
                              ['Grade', scan.securityScore?.grade ?? 'N/A'],
                              ['Timestamp', scan.timestamp.toLocaleString()],
                              ['Vulnerabilities', scan.vulnerabilities?.length ?? 0],
                              ...(scan.vulnerabilities?.map((v: any) => [v.type, v.severity]) ?? []),
                            ];
                            const csv = rows.map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `scan-${scan.url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          title="Download this scan"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32,
                            background: 'rgba(6,182,212,0.08)',
                            border: '1px solid rgba(6,182,212,0.2)',
                            borderRadius: '8px',
                            color: '#0891b2',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.15)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.08)'; }}
                        >
                          <Download style={{ width: 13, height: 13 }} />
                        </button>
                        <button
                          onClick={() => deleteScanFromHistory(scan.id)}
                          title="Delete"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32,
                            background: 'transparent',
                            border: '1px solid transparent',
                            borderRadius: '8px',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1'; }}
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'scheduled' && <ScheduledScans />}
      </main>

      {/* Modals */}
      {showComparison && user && <ComparisonReport url={comparisonUrl} scanIds={selectedScans} userId={user.uid} onClose={closeComparison} />}
      {showAIRemediation && selectedVulnerability && <AIRemediationModal isOpen={showAIRemediation} onClose={() => { setShowAIRemediation(false); setSelectedVulnerability(null); }} vulnerability={selectedVulnerability} language="JavaScript" framework="Node.js" />}
      {showContextualRisk && selectedRiskVulnerability && <ContextualRiskModal isOpen={showContextualRisk} onClose={() => { setShowContextualRisk(false); setSelectedRiskVulnerability(null); }} vulnerability={selectedRiskVulnerability} />}
      {showThreatIntelligence && selectedThreatVulnerability && <ThreatIntelligenceModal isOpen={showThreatIntelligence} onClose={() => { setShowThreatIntelligence(false); setSelectedThreatVulnerability(null); }} vulnerabilityType={selectedThreatVulnerability.type} description={selectedThreatVulnerability.description} url={selectedThreatVulnerability.url} />}
      {showPredictiveAnalytics && <PredictiveAnalyticsModal isOpen={showPredictiveAnalytics} onClose={() => setShowPredictiveAnalytics(false)} scanHistory={scanHistory} />}
      {showZeroTrustScan && <ZeroTrustModal isOpen={showZeroTrustScan} onClose={() => setShowZeroTrustScan(false)} url={url.startsWith('http') ? url : `https://${url}`} />}
      <AdvancedSecurityModal isOpen={showAdvancedSecurity} onClose={() => setShowAdvancedSecurity(false)} url={url.startsWith('http') ? url : `https://${url}`} />
        </div>{/* End z-10 wrap */}
      </div>
    </RouteGuard>
  );
}
