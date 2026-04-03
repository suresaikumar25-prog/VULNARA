'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Plus, Globe, Clock, Trash2, ToggleLeft, ToggleRight, Mail, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ScheduledScan {
  id: string;
  url: string;
  name: string;
  schedule_type: 'random' | 'weekly' | 'monthly';
  schedule_config: any;
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
  total_runs: number;
  email_notifications: boolean;
  created_at: string;
}

interface CreateScheduledScanRequest {
  url: string;
  name: string;
  schedule_type: 'random' | 'weekly' | 'monthly';
  schedule_config: any;
  email_notifications?: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduledScans() {
  const { user } = useAuth();
  const [scheduledScans, setScheduledScans] = useState<ScheduledScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    isLive: boolean;
    error?: string;
    isValidating: boolean;
  }>({ isValid: true, isLive: false, isValidating: false });

  const [formData, setFormData] = useState<CreateScheduledScanRequest>({
    url: '',
    name: '',
    schedule_type: 'random',
    schedule_config: { minIntervalHours: 24, maxIntervalHours: 72 },
    email_notifications: true,
  });

  // ── Load ──
  useEffect(() => {
    if (user) loadScheduledScans();
  }, [user]);

  // ── URL validation ──
  useEffect(() => {
    if (!formData.url) {
      setUrlValidation({ isValid: true, isLive: false, isValidating: false });
      return;
    }
    let normalized = formData.url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) normalized = 'https://' + normalized;
    try {
      const u = new URL(normalized);
      if (!u.hostname || u.hostname.length < 3) {
        setUrlValidation({ isValid: true, isLive: false, error: 'Please enter a valid domain name', isValidating: false });
        return;
      }
    } catch {
      setUrlValidation({ isValid: true, isLive: false, error: 'Please enter a valid domain name', isValidating: false });
      return;
    }
    const t = setTimeout(async () => {
      setUrlValidation(p => ({ ...p, isValidating: true }));
      try {
        const res = await fetch('/api/validate-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: normalized }) });
        const r = await res.json();
        setUrlValidation({ isValid: true, isLive: r.isLive, error: r.isLive ? undefined : r.error, isValidating: false });
      } catch {
        setUrlValidation({ isValid: true, isLive: false, error: 'Unable to check URL', isValidating: false });
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [formData.url]);

  const loadScheduledScans = async () => {
    if (!user) return;
    try {
      const { SchedulingService } = await import('@/lib/schedulingService');
      const data = await SchedulingService.getScheduledScans(user.uid);
      setScheduledScans(data);
    } catch (e) {
      console.error('Error loading scheduled scans:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { SchedulingService } = await import('@/lib/schedulingService');
      const data = await SchedulingService.createScheduledScan(user.uid, formData);
      if (data) {
        setScheduledScans([data, ...scheduledScans]);
        setShowCreateForm(false);
        setFormData({ url: '', name: '', schedule_type: 'random', schedule_config: { minIntervalHours: 24, maxIntervalHours: 72 }, email_notifications: true });
      } else alert('Error: Failed to schedule scan to DB');
    } catch { alert('Error creating scheduled scan'); }
  };

  const handleToggle = async (id: string) => {
    if (!user) return;
    try {
      const { SchedulingService } = await import('@/lib/schedulingService');
      const data = await SchedulingService.toggleScheduledScan(id, user.uid);
      if (data) setScheduledScans(scheduledScans.map(s => s.id === id ? data : s));
    } catch { alert('Error toggling scan'); }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Delete this scheduled scan?')) return;
    try {
      const { SchedulingService } = await import('@/lib/schedulingService');
      const success = await SchedulingService.deleteScheduledScan(id, user.uid);
      if (success) setScheduledScans(scheduledScans.filter(s => s.id !== id));
    } catch { alert('Error deleting scan'); }
  };

  const updateScheduleConfig = (type: string, config: any) => {
    setFormData(p => ({ ...p, schedule_type: type as any, schedule_config: config }));
  };

  const fmt = (d: string | null) => d ? new Date(d).toLocaleString() : '—';

  const G = { // glass card style
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: 16,
  } as React.CSSProperties;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12, color: 'rgba(255,255,255,0.4)' }}>
      <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: 14 }}>Loading scheduled scans…</span>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: 'var(--font-outfit), "Outfit", sans-serif' }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .sched-input {
          width: 100%;
          padding: 11px 11px 11px 40px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .sched-input:focus { border-color: rgba(6,182,212,0.5); box-shadow: 0 0 0 3px rgba(6,182,212,0.08); }
        .sched-input::placeholder { color: rgba(255,255,255,0.2); }
        .sched-select {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          cursor: pointer;
        }
        .sched-select option { background: #0d1117; color: #fff; }
        .sched-number {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
        }
        .sched-number:focus { border-color: rgba(6,182,212,0.5); }
        .scan-card:hover { border-color: rgba(6,182,212,0.2) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))',
            border: '1px solid rgba(6,182,212,0.3)',
            borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6,182,212,0.15)',
          }}>
            <Calendar size={18} color="#22d3ee" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
              Scheduled Scans
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              {scheduledScans.length} scan{scheduledScans.length !== 1 ? 's' : ''} configured
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(6,182,212,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Plus size={15} />
          Schedule Scan
        </button>
      </div>

      {/* ── Scan List ── */}
      {scheduledScans.length === 0 ? (
        <div style={{ ...G, padding: '72px 24px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Calendar size={26} color="rgba(6,182,212,0.6)" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>No Scheduled Scans</h3>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Automate your security monitoring with recurring scans.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '11px 22px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              border: 'none', borderRadius: 10,
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 16px rgba(6,182,212,0.25)',
            }}
          >
            Schedule Your First Scan
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scheduledScans.map(scan => (
            <div
              key={scan.id}
              className="scan-card"
              style={{
                ...G,
                padding: '20px 24px',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                {/* Left info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{
                      fontSize: 15, fontWeight: 700, color: '#fff',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{scan.name}</span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: scan.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                      color: scan.is_active ? '#34d399' : 'rgba(255,255,255,0.35)',
                      border: `1px solid ${scan.is_active ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`,
                      flexShrink: 0,
                    }}>
                      {scan.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    <Globe size={12} color="rgba(6,182,212,0.6)" />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {scan.url}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
                    {[
                      { label: 'Schedule', value: scan.schedule_type === 'random' ? '🎲 Random' : scan.schedule_type === 'weekly' ? '📅 Weekly' : '📆 Monthly' },
                      { label: 'Next run', value: fmt(scan.next_run) },
                      { label: 'Last run', value: fmt(scan.last_run) },
                      { label: 'Total runs', value: scan.total_runs },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(scan.id)}
                    title={scan.is_active ? 'Pause' : 'Activate'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px',
                      background: scan.is_active ? 'rgba(234,179,8,0.1)' : 'rgba(16,185,129,0.1)',
                      border: `1px solid ${scan.is_active ? 'rgba(234,179,8,0.25)' : 'rgba(16,185,129,0.25)'}`,
                      borderRadius: 9,
                      color: scan.is_active ? '#fbbf24' : '#34d399',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    {scan.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {scan.is_active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => handleDelete(scan.id)}
                    title="Delete"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 34, height: 34,
                      background: 'transparent',
                      border: '1px solid transparent',
                      borderRadius: 9,
                      color: 'rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {scan.email_notifications && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={12} color="rgba(6,182,212,0.5)" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Email notifications enabled</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Create Form Modal ── */}
      {showCreateForm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 16,
        }}>
          <div style={{
            background: 'rgba(11,15,26,0.98)',
            border: '1px solid rgba(6,182,212,0.2)',
            borderRadius: 20,
            padding: '32px',
            width: '100%', maxWidth: 580,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            fontFamily: 'inherit',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Schedule New Scan</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Configure automated security monitoring</p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* URL */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(6,182,212,0.8)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Website URL</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: urlValidation.isLive ? '#34d399' : 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="text"
                    value={formData.url}
                    onChange={e => setFormData(p => ({ ...p, url: e.target.value }))}
                    placeholder="https://example.com"
                    className="sched-input"
                    style={{ paddingRight: 40 }}
                  />
                  <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)' }}>
                    {urlValidation.isValidating
                      ? <Loader size={14} color="#fbbf24" style={{ animation: 'spin 1s linear infinite' }} />
                      : urlValidation.isLive
                      ? <CheckCircle size={14} color="#34d399" />
                      : formData.url && <AlertCircle size={14} color="#f87171" />
                    }
                  </div>
                </div>
                {formData.url && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: urlValidation.isLive ? '#34d399' : urlValidation.error ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
                    {urlValidation.isValidating ? 'Checking…' : urlValidation.isLive ? '✓ Website is live' : urlValidation.error || ''}
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(6,182,212,0.8)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Scan Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="My Security Monitor"
                  className="sched-input"
                  style={{ paddingLeft: 14 }}
                />
              </div>

              {/* Schedule Type */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(6,182,212,0.8)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Schedule Type</label>
                <select
                  value={formData.schedule_type}
                  onChange={e => {
                    const type = e.target.value as 'random' | 'weekly' | 'monthly';
                    const cfg = type === 'random' ? { minIntervalHours: 24, maxIntervalHours: 72 } : type === 'weekly' ? { dayOfWeek: 1, hour: 9, minute: 0 } : { dayOfMonth: 1, hour: 9, minute: 0 };
                    setFormData(p => ({ ...p, schedule_type: type, schedule_config: cfg }));
                  }}
                  className="sched-select"
                >
                  <option value="random">🎲 Random Intervals</option>
                  <option value="weekly">📅 Weekly</option>
                  <option value="monthly">📆 Monthly</option>
                </select>
              </div>

              {/* Config */}
              {formData.schedule_type === 'random' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>Random Interval Configuration</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Min interval (hrs)', key: 'minIntervalHours', min: 1, max: 168 },
                      { label: 'Max interval (hrs)', key: 'maxIntervalHours', min: 1, max: 168 },
                    ].map(({ label, key, min, max }) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{label}</label>
                        <input type="number" min={min} max={max}
                          value={formData.schedule_config[key] || 24}
                          onChange={e => updateScheduleConfig('random', { ...formData.schedule_config, [key]: parseInt(e.target.value) })}
                          className="sched-number" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.schedule_type === 'weekly' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>Weekly Schedule</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Day</label>
                      <select value={formData.schedule_config.dayOfWeek ?? 1}
                        onChange={e => updateScheduleConfig('weekly', { ...formData.schedule_config, dayOfWeek: parseInt(e.target.value) })}
                        className="sched-select" style={{ fontSize: 12 }}>
                        {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Hour (24h)</label>
                      <input type="number" min={0} max={23} value={formData.schedule_config.hour ?? 9}
                        onChange={e => updateScheduleConfig('weekly', { ...formData.schedule_config, hour: parseInt(e.target.value) })}
                        className="sched-number" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Minute</label>
                      <input type="number" min={0} max={59} value={formData.schedule_config.minute ?? 0}
                        onChange={e => updateScheduleConfig('weekly', { ...formData.schedule_config, minute: parseInt(e.target.value) })}
                        className="sched-number" />
                    </div>
                  </div>
                </div>
              )}

              {formData.schedule_type === 'monthly' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
                  <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>Monthly Schedule</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Day of month</label>
                      <input type="number" min={1} max={31} value={formData.schedule_config.dayOfMonth ?? 1}
                        onChange={e => updateScheduleConfig('monthly', { ...formData.schedule_config, dayOfMonth: parseInt(e.target.value) })}
                        className="sched-number" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Hour (24h)</label>
                      <input type="number" min={0} max={23} value={formData.schedule_config.hour ?? 9}
                        onChange={e => updateScheduleConfig('monthly', { ...formData.schedule_config, hour: parseInt(e.target.value) })}
                        className="sched-number" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Minute</label>
                      <input type="number" min={0} max={59} value={formData.schedule_config.minute ?? 0}
                        onChange={e => updateScheduleConfig('monthly', { ...formData.schedule_config, minute: parseInt(e.target.value) })}
                        className="sched-number" />
                    </div>
                  </div>
                </div>
              )}

              {/* Email notifications */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                <input type="checkbox" checked={formData.email_notifications}
                  onChange={e => setFormData(p => ({ ...p, email_notifications: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: '#06b6d4' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Email notifications</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Get scan results delivered to your inbox</div>
                </div>
              </label>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="button" onClick={() => setShowCreateForm(false)}
                  style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
                <button type="submit" disabled={!urlValidation.isLive}
                  style={{
                    padding: '11px 22px',
                    background: urlValidation.isLive ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.06)',
                    border: 'none', borderRadius: 10,
                    color: urlValidation.isLive ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontSize: 13, fontWeight: 700,
                    cursor: urlValidation.isLive ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    boxShadow: urlValidation.isLive ? '0 4px 16px rgba(6,182,212,0.3)' : 'none',
                  }}>
                  Schedule Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
