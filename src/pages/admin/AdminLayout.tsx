import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_ITEMS: { label: string; path: string; icon: string }[] = [
  { label: 'Dashboard',  path: '/admin',           icon: '◐' },
  { label: 'Products',   path: '/admin/products',  icon: '◇' },
  { label: 'Orders',     path: '/admin/orders',    icon: '◈' },
  { label: 'Customers',  path: '/admin/customers', icon: '◉' },
  { label: 'Reviews',    path: '/admin/reviews',   icon: '★' },
  { label: 'Enquiries',  path: '/admin/enquiries', icon: '✉' },
  { label: 'Discounts',  path: '/admin/discounts', icon: '%' },
  { label: 'Shipping',   path: '/admin/shipping',  icon: '⛟' },
  { label: 'Settings',   path: '/admin/settings',  icon: '⚙' },
];

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, roleLoading, setIsAuthOpen } = useAuth();

  if (loading || roleLoading) {
    return <div style={{ padding: 80, textAlign: 'center', fontFamily: 'serif' }}>Loading…</div>;
  }
  if (!user) {
    return (
      <div style={{ padding: 80, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12 }}>Admin Access</h2>
        <p style={{ color: '#666', marginBottom: 20 }}>Please sign in with an admin account.</p>
        <button
          onClick={() => setIsAuthOpen(true)}
          style={{ padding: '14px 28px', background: '#0a0a0a', color: '#fafafa', border: 0, cursor: 'pointer', letterSpacing: '0.16em', fontSize: 12 }}
        >SIGN IN</button>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div style={{ padding: 80, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12 }}>Not authorised</h2>
        <p style={{ color: '#666' }}>Your account does not have admin privileges.</p>
      </div>
    );
  }
  return <>{children}</>;
}

export default function AdminLayout({
  title, subtitle, children, currentPath,
}: { title: string; subtitle?: string; children: ReactNode; currentPath: string; }) {
  return (
    <AdminGate>
      <div style={{ minHeight: '100vh', background: '#f6f6f4', display: 'grid', gridTemplateColumns: '240px 1fr' }} className="admin-shell">
        <aside style={{
          background: '#0a0a0a', color: '#e9e9e7', padding: '28px 0',
          position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        }} className="admin-sidebar">
          <a href="/" style={{
            display: 'block', padding: '0 24px 24px', fontFamily: 'Cormorant Garamond, serif',
            fontSize: 22, letterSpacing: '0.18em', borderBottom: '1px solid #1e1e1e', marginBottom: 18,
          }}>Aital · ADMIN</a>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            {SIDEBAR_ITEMS.map(item => {
              const active = item.path === '/admin'
                ? currentPath === '/admin'
                : currentPath.startsWith(item.path);
              return (
                <a key={item.path} href={item.path} style={{
                  padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12,
                  fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: active ? '#1e1e1e' : 'transparent',
                  color: active ? '#fff' : '#b9b9b6',
                  borderLeft: active ? '3px solid #fff' : '3px solid transparent',
                  textDecoration: 'none',
                }}>
                  <span style={{ width: 16, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </a>
              );
            })}
          </nav>
          <a href="/" style={{
            display: 'block', padding: '24px', marginTop: 30, fontSize: 11,
            letterSpacing: '0.16em', color: '#777', textTransform: 'uppercase',
          }}>← Back to store</a>
        </aside>
        <main style={{ padding: '40px 48px', overflowX: 'hidden' }} className="admin-main">
          <header style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 400, letterSpacing: '0.02em' }}>{title}</h1>
            {subtitle && <p style={{ color: '#777', marginTop: 6, fontSize: 14 }}>{subtitle}</p>}
            <div style={{ height: 1, background: '#dcdcd7', marginTop: 18 }} />
          </header>
          {children}
        </main>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 900px) {
            .admin-shell { grid-template-columns: 1fr !important; }
            .admin-sidebar { position: static !important; height: auto !important; }
            .admin-main { padding: 24px 16px !important; }
          }
        ` }} />
      </div>
    </AdminGate>
  );
}

// shared atom styles (utilitarian)
export const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e5e0', borderRadius: 4, padding: 20 };
export const th: React.CSSProperties = { textAlign: 'left', padding: '12px 14px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#777', borderBottom: '1px solid #e5e5e0', background: '#fafafa' };
export const td: React.CSSProperties = { padding: '14px', fontSize: 14, borderBottom: '1px solid #efefea', verticalAlign: 'middle' };
export const input: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #d8d8d3', borderRadius: 3, fontSize: 14, fontFamily: 'inherit', background: '#fff' };
export const label: React.CSSProperties = { fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: 6, display: 'block' };
export const btn: React.CSSProperties = { padding: '10px 18px', background: '#0a0a0a', color: '#fafafa', border: 0, cursor: 'pointer', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' };
export const btnGhost: React.CSSProperties = { padding: '10px 18px', background: '#fff', color: '#0a0a0a', border: '1px solid #0a0a0a', cursor: 'pointer', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' };
export const badge = (color: string): React.CSSProperties => ({
  display: 'inline-block', padding: '4px 10px', borderRadius: 999, fontSize: 11,
  background: color + '20', color, letterSpacing: '0.06em', textTransform: 'uppercase',
});
