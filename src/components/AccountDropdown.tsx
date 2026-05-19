import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AccountDropdown() {
  const { user, isAdmin, setIsAuthOpen, setAuthMode, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
    setOpen(false);
  };

  const initials = user
    ? ((user.firstName?.[0] || '') + (user.lastName?.[0] || '') || (user.email || '?')[0]).toUpperCase()
    : '';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        aria-label="Account"
        onClick={() => {
          if (!user) { setAuthMode('login'); setIsAuthOpen(true); }
          else setOpen(v => !v);
        }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 6, position: 'relative', color: '#1a1a1a',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {user ? (
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: '#c9a96e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Montserrat', sans-serif", fontSize: 10, fontWeight: 700, color: '#fff',
          }}>
            {initials}
          </div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </button>

      {open && user && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 900 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 220, background: '#faf8f5', border: '1px solid #ede5dc',
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)', zIndex: 1000,
            animation: 'fadeUp 0.18s ease',
          }}>
            {/* User info */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #ede5dc' }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>
                {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'My Account'}
              </div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, color: '#8a7e76', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
            {[
              { label: 'My Orders', icon: '📦', path: '/account/orders' },
              { label: 'Wishlist', icon: '♡', path: '/account/wishlist' },
              { label: 'Account Settings', icon: '⚙', path: '/account/settings' },
              ...(isAdmin ? [{ label: 'Admin Dashboard', icon: '◐', path: '/admin' }] : []),
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#1a1a1a',
                  textAlign: 'left', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0ece8')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span> {item.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid #ede5dc' }}>
              <button
                onClick={async () => { await signOut(); setOpen(false); }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#c0392b',
                  textAlign: 'left', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf5f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: 14 }}>→</span> Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
