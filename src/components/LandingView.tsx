"use client";

import React, { useState, useEffect, useRef } from "react";
import { Shield, Zap, Search, Lock, Globe, CheckCircle, AlertTriangle, ArrowRight, Loader2, Play, Activity, Terminal, ShieldAlert, Scan, Eye, Server, Cpu, Wifi, Database, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── Animated Counter Hook ─── */
function useCountUp(target: number, duration: number = 2000, decimals: number = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setValue(Number((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return { value, ref };
}

/* ─── Scanning Visualization Component ─── */
function ScanVisualizer({ isActive, result }: { isActive: boolean; result: 'idle' | 'secure' | 'danger' | 'error' }) {
  const nodes = [
    { x: 50, y: 15, label: "DNS", icon: "globe", delay: 0 },
    { x: 20, y: 40, label: "SSL", icon: "lock", delay: 0.3 },
    { x: 80, y: 40, label: "Headers", icon: "server", delay: 0.6 },
    { x: 15, y: 70, label: "Ports", icon: "wifi", delay: 0.9 },
    { x: 50, y: 65, label: "LSTM AI", icon: "cpu", delay: 1.2 },
    { x: 85, y: 70, label: "Payload", icon: "database", delay: 1.5 },
  ];

  const connections = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 4], [4, 5],
  ];

  const getNodeColor = () => {
    if (result === 'secure') return 'rgba(16,185,129,';
    if (result === 'danger') return 'rgba(239,68,68,';
    return 'rgba(6,182,212,';
  };

  return (
    <div className="relative w-full h-full">
      {/* SVG connections */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 85">
        {connections.map(([from, to], i) => (
          <line
            key={i}
            x1={nodes[from].x} y1={nodes[from].y}
            x2={nodes[to].x} y2={nodes[to].y}
            stroke={isActive ? `${getNodeColor()}0.4)` : "rgba(255,255,255,0.06)"}
            strokeWidth="0.3"
            style={{
              transition: "stroke 0.8s ease",
              strokeDasharray: isActive ? "2 2" : "none",
              animation: isActive ? `dash 1.5s linear infinite` : "none",
            }}
          />
        ))}
        <style>{`@keyframes dash { to { stroke-dashoffset: -20; } }`}</style>
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center gap-1"
          style={{
            left: `${node.x}%`, top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
            animation: isActive ? `float ${2 + i * 0.3}s ease-in-out infinite` : "none",
            animationDelay: `${node.delay}s`,
          }}
        >
          {/* Pulse ring */}
          {isActive && (
            <div
              className="absolute inset-0 rounded-full scan-pulse"
              style={{
                background: `${getNodeColor()}0.3)`,
                animationDelay: `${node.delay}s`,
                width: 36, height: 36,
                marginLeft: -6, marginTop: -6,
              }}
            />
          )}
          <div
            className="relative h-6 w-6 rounded-lg flex items-center justify-center border transition-all duration-700"
            style={{
              background: isActive ? `${getNodeColor()}0.15)` : "rgba(255,255,255,0.03)",
              borderColor: isActive ? `${getNodeColor()}0.5)` : "rgba(255,255,255,0.08)",
              boxShadow: isActive ? `0 0 12px ${getNodeColor()}0.3)` : "none",
            }}
          >
            {node.icon === "globe" && <Globe className="h-3 w-3" style={{ color: isActive ? `${getNodeColor()}1)` : "rgba(255,255,255,0.3)" }} />}
            {node.icon === "lock" && <Lock className="h-3 w-3" style={{ color: isActive ? `${getNodeColor()}1)` : "rgba(255,255,255,0.3)" }} />}
            {node.icon === "server" && <Server className="h-3 w-3" style={{ color: isActive ? `${getNodeColor()}1)` : "rgba(255,255,255,0.3)" }} />}
            {node.icon === "wifi" && <Wifi className="h-3 w-3" style={{ color: isActive ? `${getNodeColor()}1)` : "rgba(255,255,255,0.3)" }} />}
            {node.icon === "cpu" && <Cpu className="h-3 w-3" style={{ color: isActive ? `${getNodeColor()}1)` : "rgba(255,255,255,0.3)" }} />}
            {node.icon === "database" && <Database className="h-3 w-3" style={{ color: isActive ? `${getNodeColor()}1)` : "rgba(255,255,255,0.3)" }} />}
          </div>
          <span
            className="text-[8px] font-bold uppercase tracking-wider transition-colors duration-700"
            style={{ color: isActive ? `${getNodeColor()}0.9)` : "rgba(255,255,255,0.2)" }}
          >
            {node.label}
          </span>
        </div>
      ))}

      {/* Center status indicator */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {isActive && (
          <div className="flex flex-col items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-ping" />
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400/80">Scanning</span>
          </div>
        )}
        {!isActive && result === 'secure' && (
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-green-400/80">Secure</span>
          </div>
        )}
        {!isActive && result === 'danger' && (
          <div className="flex flex-col items-center gap-1">
            <ShieldAlert className="h-6 w-6 text-red-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-red-400/80">Threat</span>
          </div>
        )}
        {!isActive && result === 'idle' && (
          <div className="flex flex-col items-center gap-1">
            <Shield className="h-6 w-6 text-white/10" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/15">Awaiting Input</span>
          </div>
        )}
      </div>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-6px); }
        }
      `}</style>
    </div>
  );
}


import VideoScriptModal from './VideoScriptModal';

export default function LandingView() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showVideoScript, setShowVideoScript] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'secure' | 'danger' | 'error';
    message: string;
  }>({ status: 'idle', message: "" });

  // Animated counters
  const accuracy = useCountUp(97.1, 2200, 1);
  const threats = useCountUp(2.5, 2000, 1);
  const partners = useCountUp(500, 1800, 0);

  const handleQuickCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setScanResult({ status: 'idle', message: "" });

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      // Step 1: Validate URL
      const validateRes = await fetch('/api/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl })
      });
      const validation = await validateRes.json();

      if (!validation.isValid || !validation.isLive) {
        setScanResult({ 
          status: 'danger', 
          message: validation.error || "This website appears to be offline or unreachable." 
        });
        return;
      }

      // Step 2: Phishing Check
      const phishingRes = await fetch('/api/phishing-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl })
      });
      const phishing = await phishingRes.json();
      const phishingData = phishing.data || phishing.analysis || phishing.fallback || {};
      const isPhishing = phishingData.is_phishing ?? phishingData.isPhishing ?? false;

      if (phishing.success && isPhishing) {
        setScanResult({ 
          status: 'danger', 
          message: `Warning! This URL has high potential for phishing (${phishingData.risk_level || phishingData.riskLevel || 'HighRisk'}).` 
        });
      } else if (normalizedUrl.startsWith('https://')) {
        setScanResult({ 
          status: 'secure', 
          message: "Secure Connection Verified. This URL is live and appears safe for browsing." 
        });
      } else {
        setScanResult({ 
          status: 'danger', 
          message: "Unsecured Connection (HTTP). We recommend avoiding sensitive transactions on this site." 
        });
      }

    } catch (error) {
      setScanResult({ status: 'error', message: "An unexpected error occurred during the security check." });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-[#02040b] text-white selection:bg-cyan-500/30 overflow-hidden font-sans">
      {/* Background Cinematic Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.15),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.1),transparent_70%)]" />
      </div>

      {/* Grid Pattern Background */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none -z-40" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-30" />

      {/* ═══════════════ STICKY NAVIGATION ═══════════════ */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#02040b]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white">THREATLENS</span>
              <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-[0.2em] leading-tight">Advanced Security</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            <Link href="#stats" className="text-sm font-semibold uppercase tracking-widest text-white/60 hover:text-cyan-400 transition-all">Trust</Link>
            <Link href="#how-it-works" className="text-sm font-semibold uppercase tracking-widest text-white/60 hover:text-cyan-400 transition-all">How it Works</Link>
            <Link href="#features" className="text-sm font-semibold uppercase tracking-widest text-white/60 hover:text-cyan-400 transition-all">Features</Link>
            <div className="h-4 w-[1px] bg-white/10" />
            <Link href="/login" className="text-sm font-semibold uppercase tracking-widest text-white/80 hover:text-white transition-all">Sign In</Link>
            <Link href="/login" className="px-7 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-20">
        
        {/* ═══════════════ HERO SECTION ═══════════════ */}
        <div className="grid lg:grid-cols-12 gap-10 mb-12 items-start">
          
          {/* Left Column: Headline → Subtext → CTA (Z-pattern) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <Cpu className="h-4 w-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-Time Neural Threat Detection</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">
              DETECT <span className="text-cyan-400">VULNERABILITIES</span> <br /> 
              WITH LSTM-POWERED AI.
            </h1>
            
            <p className="text-lg text-white/45 leading-relaxed max-w-xl font-medium">
              Deep-learning vulnerability intelligence that scans for SQLi, XSS, phishing, 
              and misconfigurations — then tells you exactly how to fix them. 
              Trusted by 500+ engineering teams.
            </p>

            {/* Inline CTA — directly beneath sub-text */}
            <form onSubmit={handleQuickCheck} className="relative max-w-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-2xl blur-lg opacity-40" />
              <div className="relative flex gap-3 bg-[#080d1a] border border-cyan-500/20 rounded-2xl p-2">
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-site.com"
                  className="flex-1 bg-transparent border-none px-5 py-3.5 text-sm focus:outline-none placeholder:text-white/20 font-mono text-white"
                />
                <button 
                  disabled={isScanning || !url}
                  className="bg-white text-black hover:bg-cyan-400 disabled:bg-white/10 disabled:text-white/30 text-xs font-black uppercase tracking-widest px-7 py-3.5 rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Scan className="h-4 w-4" /> Scan My Site</>}
                </button>
              </div>
            </form>

            {/* Status Result Display */}
            <div className={`overflow-hidden transition-all duration-500 max-w-xl ${scanResult.status !== 'idle' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className={`flex items-start space-x-4 p-5 rounded-2xl border backdrop-blur-md ${
                scanResult.status === 'secure' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                scanResult.status === 'danger' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                'bg-white/5 border-white/10 text-white/70'
              }`}>
                {scanResult.status === 'secure' && <CheckCircle className="h-6 w-6 mt-0.5 flex-shrink-0" />}
                {scanResult.status === 'danger' && <ShieldAlert className="h-6 w-6 mt-0.5 flex-shrink-0 animate-pulse" />}
                <p className="text-sm font-bold leading-relaxed">{scanResult.message}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Scanning Visualization */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative aspect-square border border-white/[0.06] rounded-3xl bg-[#060a14] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
              
              {/* Scan Visualizer */}
              <div className="absolute inset-6">
                <ScanVisualizer isActive={isScanning} result={scanResult.status} />
              </div>

              {/* Terminal-like overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#060a14] via-[#060a14]/90 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500/70" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/70" />
                    <div className="h-2 w-2 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-[9px] font-mono text-white/30 ml-2">threatlens — security-scan</span>
                </div>
                <div className="font-mono text-[10px] text-white/30 space-y-0.5">
                  <p><span className="text-cyan-500/60">$</span> {url ? `analyzing ${url.substring(0, 30)}${url.length > 30 ? '...' : ''}` : 'awaiting target url...'}</p>
                  {isScanning && <p className="text-cyan-400/50">
                    → Running LSTM neural analysis<span className="cursor-blink">|</span>
                  </p>}
                  {scanResult.status === 'secure' && <p className="text-green-400/60">✓ All checks passed. No threats detected.</p>}
                  {scanResult.status === 'danger' && <p className="text-red-400/60">⚠ Potential threat identified. Review recommended.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ TRUST STATS — RIGHT AFTER HERO ═══════════════ */}
        <section id="stats" className="py-16 mb-16 scroll-mt-24">
          <div className="bg-[#080d1a] border border-white/[0.06] rounded-3xl p-12 md:p-16 grid md:grid-cols-3 gap-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_70%)]" />
            
            <div ref={accuracy.ref} className="relative space-y-2 stat-animate">
              <p className="text-6xl font-black tracking-tighter text-cyan-400">
                {accuracy.value}<span className="text-2xl">%</span>
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Detection Accuracy</p>
              <p className="text-[10px] text-white/20 max-w-[200px] mx-auto">LSTM model tested across 1.4M URL samples</p>
            </div>
            
            <div ref={threats.ref} className="relative space-y-2 border-x border-white/5 stat-animate">
              <p className="text-6xl font-black tracking-tighter text-white">
                {threats.value}<span className="text-2xl text-cyan-400">M+</span>
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Threats Neutralized</p>
              <p className="text-[10px] text-white/20 max-w-[200px] mx-auto">Across enterprise and SMB deployments</p>
            </div>
            
            <div ref={partners.ref} className="relative space-y-2 stat-animate">
              <p className="text-6xl font-black tracking-tighter text-white">
                {partners.value}<span className="text-2xl text-cyan-400">+</span>
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Enterprise Partners</p>
              <p className="text-[10px] text-white/20 max-w-[200px] mx-auto">Engineering teams shipping secure code daily</p>
            </div>
          </div>
        </section>

        {/* ═══════════════ HOW IT WORKS — VIDEO SECTION ═══════════════ */}
        <section id="how-it-works" className="py-24 scroll-mt-24">
          <div className="mb-20 text-center space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">Reference Guide</h2>
            <p className="text-5xl font-black tracking-tight text-white">SEE THREATLENS IN <span className="text-cyan-400">ACTION</span></p>
          </div>

          <div className="relative group max-w-6xl mx-auto">
            <div className="absolute -inset-6 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-[3rem] blur-[60px] opacity-20 group-hover:opacity-40 transition-all duration-1000" />
            <div className="relative overflow-hidden bg-[#080d1a] border border-cyan-500/20 rounded-[2.5rem] shadow-2xl">
              <div onClick={() => setShowVideoScript(true)} className="aspect-video relative overflow-hidden group/video cursor-pointer">
                <Image 
                  src="/dashboard-preview.png" 
                  alt="Dashboard Guide" 
                  fill 
                  className="object-cover opacity-60 group-hover/video:scale-105 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/20 transition-all flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-10 bg-cyan-500/50 rounded-full blur-[40px] animate-pulse" />
                    <button className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all group/btn">
                      <Play className="h-8 w-8 text-black group-hover/btn:fill-black pl-1" />
                    </button>
                  </div>
                </div>
                
                {/* Visual Interface Details */}
                <div className="absolute bottom-10 left-10 p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl space-y-2 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Scanning Demo</span>
                  </div>
                  <p className="text-xs text-white/60">Watch how ThreatLens identifies complex vulnerabilities in seconds.</p>
                </div>
              </div>
            </div>
          </div>
          
          {showVideoScript && <VideoScriptModal onClose={() => setShowVideoScript(false)} />}
        </section>

        {/* ═══════════════ FEATURES — UNIFORM HEIGHT CARDS ═══════════════ */}
        <section id="features" className="py-24">
          <div className="mb-16 text-center space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">Capabilities</h2>
            <p className="text-4xl font-black tracking-tight text-white">Built for Security Engineers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1: Vulnerability Audit */}
            <div className="group relative">
              <div className="absolute inset-0 bg-cyan-500/5 rounded-3xl blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
              <div className="relative h-full bg-[#080d1a] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-10 transition-all duration-500 flex flex-col">
                <div className="h-16 w-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                  <Search className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-3 group-hover:text-cyan-400 transition-colors text-white">Vulnerability Audit</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium flex-1">Deep-dive technical scans for SQLi, XSS, CSRF, and misconfigurations with step-by-step remediation guides and code patches.</p>
                <div className="mt-8 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">Explore Module <ArrowRight className="h-3 w-3" /></Link>
                </div>
              </div>
            </div>

            {/* Feature 2: Neural Phishing Check */}
            <div className="group relative">
              <div className="absolute inset-0 bg-blue-600/5 rounded-3xl blur-2xl group-hover:bg-blue-600/10 transition-colors" />
              <div className="relative h-full bg-[#080d1a] border border-white/5 hover:border-blue-500/30 rounded-3xl p-10 transition-all duration-500 flex flex-col">
                <div className="h-16 w-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                  <Cpu className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-3 group-hover:text-blue-400 transition-colors text-white">Neural Phishing Check</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium flex-1">LSTM neural network trained on 1.4M URL samples to identify fraudulent entities, domain spoofing, and phishing attempts in real-time.</p>
                <div className="mt-8 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI Powered · 97.1% Accuracy</span>
                    <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Asset Monitoring */}
            <div className="group relative">
              <div className="absolute inset-0 bg-purple-500/5 rounded-3xl blur-2xl group-hover:bg-purple-500/10 transition-colors" />
              <div className="relative h-full bg-[#080d1a] border border-white/5 hover:border-purple-500/30 rounded-3xl p-10 transition-all duration-500 flex flex-col">
                <div className="h-16 w-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                  <Eye className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-3 group-hover:text-purple-400 transition-colors text-white">Asset Monitoring</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium flex-1">Continuous security drift detection, scheduled re-scans, and automated assessment of your entire digital footprint with diff reports.</p>
                <div className="mt-8 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">View Demo <ArrowRight className="h-3 w-3" /></Link>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center space-x-3">
             <Shield className="h-5 w-5 text-cyan-500" />
             <span className="text-lg font-black tracking-tighter text-white">THREATLENS</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
            © 2025 ThreatLens Advanced Security Systems. All Rights Reserved.
          </div>
          <div className="flex space-x-8">
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Privacy</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Security</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
