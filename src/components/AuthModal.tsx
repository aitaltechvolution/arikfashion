import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

type Step = 'form' | 'check-email' | 'done';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, authMode, setAuthMode, signIn, signUp, user } = useAuth();

  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Optional purchase details (signup only)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (isAuthOpen) {
      setStep('form');
      setEmail(''); setPassword(''); setShowPassword(false);
      setFirstName(''); setLastName(''); setPhone('');
      setAddress(''); setCity(''); setState(''); setCountry(''); setZip('');
      setError(null); setLoading(false);
    }
  }, [isAuthOpen]);

  // Auto-close after done
  useEffect(() => {
    if (step === 'done') {
      const t = setTimeout(() => setIsAuthOpen(false), 1600);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !email.includes('@')) { setError('Enter a valid email address'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    if (authMode === 'login') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) { setError(error); return; }
      setStep('done');
    } else {
      const { error, needsConfirm } = await signUp(email, password, {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        zip: zip || undefined,
      });
      setLoading(false);
      if (error) { setError(error); return; }
      setStep(needsConfirm ? 'check-email' : 'done');
    }
  };

  if (!isAuthOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1px solid #d4c9c0',
    background: '#fff', fontFamily: "'Montserrat', sans-serif", fontSize: 13,
    color: '#1a1a1a', outline: 'none', transition: 'border-color 0.25s ease',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 11,
    letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3d342c', marginBottom: 6,
  };

  const btnStyle: React.CSSProperties = {
    width: '100%', background: '#1a1a1a', color: '#fafafa', border: 'none',
    padding: '15px', fontFamily: "'Montserrat', sans-serif", fontSize: 12,
    letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'background 0.25s ease, transform 0.15s ease',
  };

  return (
    <>
      <style>{`
        @keyframes authSlideUp {
          from { transform: translate(-50%, calc(-50% + 32px)); opacity: 0; }
          to   { transform: translate(-50%, -50%); opacity: 1; }
        }
        @keyframes authFade { from { opacity: 0; } to { opacity: 1; } }
        .auth-input:focus { border-color: #c9a96e !important; box-shadow: 0 0 0 3px rgba(201,169,110,0.12); }
        .auth-tab { background: none; border: none; padding: 0 0 10px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; border-bottom: 2px solid transparent; transition: all 0.25s ease; color: #7a6e66; }
        .auth-tab.active { color: #1a1a1a; border-bottom-color: #c9a96e; }
        .auth-close-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; padding: 4px; color: #1a1a1a; transition: opacity 0.2s ease; }
        .auth-close-btn:hover { opacity: 0.45; }
        .auth-main-btn:hover:not(:disabled) { background: #c9a96e !important; }
        .auth-main-btn:active:not(:disabled) { transform: scale(0.985); }
        .auth-password-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #4a3e36; font-family: 'Montserrat', sans-serif; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 6px; }
        .auth-scroll::-webkit-scrollbar { width: 6px; }
        .auth-scroll::-webkit-scrollbar-thumb { background: #d4c9c0; border-radius: 3px; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={() => setIsAuthOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.55)', zIndex: 2200, backdropFilter: 'blur(4px)', animation: 'authFade 0.3s cubic-bezier(0.22,1,0.36,1)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        width: 'min(94vw, 480px)', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        background: '#faf8f5', zIndex: 2300,
        boxShadow: '0 40px 100px rgba(0,0,0,0.24)',
        animation: 'authSlideUp 0.38s cubic-bezier(0.22,1,0.36,1)',
        transform: 'translate(-50%, -50%)',
      }}>
        {/* Header */}
        <div style={{ padding: '26px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: '#1a1a1a', marginBottom: 4 }}>
              {step === 'form' && (authMode === 'login' ? 'Welcome back' : 'Join us')}
              {step === 'check-email' && 'Check your inbox'}
              {step === 'done' && 'You\'re in ✓'}
            </div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3d342c' }}>
              {step === 'form' && (authMode === 'login' ? 'Sign in with email & password' : 'Save your details for faster checkout')}
              {step === 'check-email' && `We sent a confirmation link to ${email}`}
              {step === 'done' && 'Signed in successfully'}
            </div>
          </div>
          <button className="auth-close-btn" onClick={() => setIsAuthOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        {step === 'form' && (
          <div style={{ padding: '16px 28px 0', display: 'flex', gap: 24, borderBottom: '1px solid #ede5dc', flexShrink: 0 }}>
            <button className={`auth-tab${authMode === 'login' ? ' active' : ''}`} onClick={() => { setAuthMode('login'); setError(null); }}>Sign In</button>
            <button className={`auth-tab${authMode === 'signup' ? ' active' : ''}`} onClick={() => { setAuthMode('signup'); setError(null); }}>Create Account</button>
          </div>
        )}

        {/* Body */}
        <div className="auth-scroll" style={{ padding: '24px 28px 28px', overflowY: 'auto' }}>

          {step === 'form' && (
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={inputStyle}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="auth-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(null); }}
                    placeholder={authMode === 'signup' ? 'At least 6 characters' : '••••••••'}
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    style={{ ...inputStyle, paddingRight: 70 }}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Signup-only: purchase details */}
              {authMode === 'signup' && (
                <>
                  <div style={{ marginTop: 8, padding: '12px 14px', background: '#f4ece1', borderLeft: '3px solid #c9a96e' }}>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#3d342c', letterSpacing: '0.04em', lineHeight: 1.5, margin: 0 }}>
                      <strong style={{ fontWeight: 700, color: '#1a1a1a' }}>Optional</strong> — Save your shipping details now and we'll auto-fill them at checkout. You can edit anytime in your account.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input className="auth-input" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Amara" style={inputStyle} autoComplete="given-name" />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input className="auth-input" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Okafor" style={inputStyle} autoComplete="family-name" />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input className="auth-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" style={inputStyle} autoComplete="tel" />
                  </div>

                  <div>
                    <label style={labelStyle}>Street Address</label>
                    <input className="auth-input" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="12 Akin Adesola Street" style={inputStyle} autoComplete="street-address" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>City</label>
                      <input className="auth-input" type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Lagos" style={inputStyle} autoComplete="address-level2" />
                    </div>
                    <div>
                      <label style={labelStyle}>State / Region</label>
                      <input className="auth-input" type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Lagos" style={inputStyle} autoComplete="address-level1" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Country</label>
                      <input className="auth-input" type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="Nigeria" style={inputStyle} autoComplete="country-name" />
                    </div>
                    <div>
                      <label style={labelStyle}>Postal / ZIP</label>
                      <input className="auth-input" type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="100001" style={inputStyle} autoComplete="postal-code" />
                    </div>
                  </div>
                </>
              )}

              {error && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: '#c0392b', letterSpacing: '0.03em', margin: 0 }}>{error}</p>}

              <button className="auth-main-btn" type="submit" style={{ ...btnStyle, marginTop: 4 }} disabled={loading}>
                {loading
                  ? (authMode === 'login' ? 'Signing in…' : 'Creating account…')
                  : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>

              {authMode === 'login' && (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#3d342c', textAlign: 'center', letterSpacing: '0.04em', margin: 0 }}>
                  New here?{' '}
                  <button type="button" onClick={() => { setAuthMode('signup'); setError(null); }} style={{ background: 'none', border: 'none', color: '#c9a96e', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}>
                    Create an account
                  </button>
                </p>
              )}
            </form>
          )}

          {step === 'check-email' && (
            <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0ece8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#1a1a1a', marginBottom: 8 }}>
                Confirm your email
              </p>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: '#3d342c', lineHeight: 1.6, letterSpacing: '0.03em', maxWidth: 340, margin: '0 auto' }}>
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
              </p>
              <button onClick={() => { setAuthMode('login'); setStep('form'); }} style={{ ...btnStyle, marginTop: 20 }} className="auth-main-btn">
                Back to Sign In
              </button>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0ece8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.8" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#1a1a1a', marginBottom: 6 }}>
                Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
              </p>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: '#3d342c', letterSpacing: '0.08em' }}>
                Your account is ready. Closing…
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
