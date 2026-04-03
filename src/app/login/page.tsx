"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Lock, User, Mail, Check, X, RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");

  const { user, signIn, signUp, resendConfirmation, loading: authLoading } = useAuth();
  const router = useRouter();

  // Password validation state
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const validatePassword = (pwd: string) => {
    const strength = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    };
    setPasswordStrength(strength);
    return Object.values(strength).every(Boolean);
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, router, authLoading]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '2px solid rgba(0,0,0,0.05)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResendSuccess(false);

    if (isSignUp && !validatePassword(password)) {
      setError("Password does not meet the security requirements.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const result = await signUp(email, password, name);
        if (result.needsConfirmation) {
          // Email confirmation required — show confirmation screen
          setAwaitingConfirmation(true);
          setUnconfirmedEmail(email);
        } else {
          router.push('/');
        }
      } else {
        await signIn(email, password);
        router.push('/');
      }
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_CONFIRMED') {
        // User signed up before but hasn't confirmed yet
        setUnconfirmedEmail(email);
        setAwaitingConfirmation(true);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendingEmail(true);
    setResendSuccess(false);
    try {
      await resendConfirmation(unconfirmedEmail);
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResendingEmail(false);
    }
  };

  // ── Email awaiting confirmation screen ──
  if (awaitingConfirmation) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          padding: '48px 40px',
          width: '100%',
          maxWidth: 460,
          textAlign: 'center',
          fontFamily: '"Outfit", sans-serif',
        }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#eff6ff',
            border: '2px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Mail size={32} color="#3b82f6" />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Check your inbox</h2>
          <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
            We sent a confirmation link to
          </p>
          <p style={{
            color: '#1d4ed8', fontWeight: 600, fontSize: 15,
            background: '#dbeafe',
            border: '1px solid #bfdbfe',
            borderRadius: 8, padding: '6px 14px',
            display: 'inline-block', marginBottom: 28,
          }}>
            {unconfirmedEmail}
          </p>

          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
            Click the link in the email to verify your account. After confirming, come back here and sign in.
          </p>

          {resendSuccess && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#d1fae5', border: '1px solid #a7f3d0',
              borderRadius: 10, padding: '10px 16px', marginBottom: 16,
              color: '#059669', fontSize: 14, justifyContent: 'center',
            }}>
              <CheckCircle size={16} /> Confirmation email resent!
            </div>
          )}

          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '10px 16px', marginBottom: 16,
              color: '#dc2626', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resendingEmail}
            style={{
              width: '100%', padding: '13px', borderRadius: 12,
              background: '#3b82f6',
              color: '#fff', fontWeight: 700, fontSize: 14,
              border: 'none', cursor: resendingEmail ? 'not-allowed' : 'pointer',
              opacity: resendingEmail ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 16, fontFamily: 'inherit',
            }}
          >
            {resendingEmail
              ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
              : <><RefreshCw size={16} /> Resend Confirmation Email</>
            }
          </button>

          <button
            onClick={() => {
              setAwaitingConfirmation(false);
              setIsSignUp(false);
              setError('');
              setResendSuccess(false);
            }}
            style={{
              background: 'transparent', border: 'none', color: '#64748b',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Back to sign in
          </button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Main login / signup form ──
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .auth-input {
          width: 100%;
          padding: 13px 13px 13px 44px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #0f172a;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus { 
          border-color: #3b82f6; 
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .auth-input::placeholder { color: #94a3b8; }
      `}</style>

      <div style={{
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        borderRadius: 20,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 460,
        fontFamily: '"Outfit", sans-serif',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            border: '2px solid #bfdbfe',
            background: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 14px rgba(59,130,246,0.1)',
          }}>
            <Shield size={24} color="#2563eb" />
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800,
            background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', margin: 0, letterSpacing: '-0.02em',
          }}>ThreatLens</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 12, padding: '12px 16px',
            color: '#dc2626', fontSize: 14, marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name (signup only) */}
          {isSignUp && (
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                  required={isSignUp} placeholder="Enter your full name" className="auth-input" />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" className="auth-input" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input id="password" type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); if (isSignUp) validatePassword(e.target.value); }}
                required placeholder="••••••••" className="auth-input"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Password requirements (signup) */}
          {isSignUp && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Password requirements</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { key: 'length', label: 'At least 8 characters' },
                  { key: 'uppercase', label: 'One uppercase letter (A–Z)' },
                  { key: 'lowercase', label: 'One lowercase letter (a–z)' },
                  { key: 'number', label: 'One number (0–9)' },
                  { key: 'special', label: 'One special character (!@#$...)' },
                ].map(({ key, label }) => {
                  const ok = passwordStrength[key as keyof typeof passwordStrength];
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: ok ? '#059669' : '#94a3b8' }}>
                      {ok ? <Check size={12} /> : <X size={12} />}
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !email || !password || (isSignUp && (!name || !isPasswordStrong))}
            style={{
              width: '100%', padding: '14px',
              background: '#2563eb',
              color: '#fff', fontWeight: 600, fontSize: 15,
              border: 'none', borderRadius: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: (isLoading || !email || !password || (isSignUp && (!name || !isPasswordStrong))) ? 0.6 : 1,
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              marginTop: 4,
            }}
          >
            {isLoading
              ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{isSignUp ? 'Creating account...' : 'Signing in...'}</>
              : isSignUp ? 'Create Account' : 'Sign In'
            }
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => { setIsSignUp(s => !s); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

      </div>
    </div>
  );
}
