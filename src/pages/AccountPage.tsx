import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fff8e1', color: '#f57f17' },
  confirmed:  { bg: '#e8f5e9', color: '#2e7d32' },
  processing: { bg: '#e3f2fd', color: '#1565c0' },
  shipped:    { bg: '#f3e5f5', color: '#6a1b9a' },
  delivered:  { bg: '#e8f5e9', color: '#1b5e20' },
  cancelled:  { bg: '#ffebee', color: '#c62828' },
};

interface AccountPageProps { section: string; }

export default function AccountPage({ section }: AccountPageProps) {
  const { user, orders, fetchOrders, signOut, setIsAuthOpen, setAuthMode, updateProfile, loading, roleLoading } = useAuth();
  const { wishlist, toggleWishlist } = useCart();

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  if (loading || roleLoading) {
    return <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontSize: 18, color: '#888' }}>Loading…</div>;
  }

  if (!user) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '60px 20px', background: '#faf8f5', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0ece8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#b0a49a" strokeWidth="1.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </div>
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, marginBottom: 8 }}>Sign in to your account</p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#3d342c', letterSpacing: '0.08em' }}>Track orders, manage your wishlist and more</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
            style={{ background: '#1a1a1a', color: '#fafafa', border: 'none', padding: '13px 32px', fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
            style={{ background: 'none', color: '#1a1a1a', border: '1px solid #d4c9c0', padding: '13px 32px', fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '♡' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  const activeSection = section || 'orders';

  return (
    <>
      <style>{`
        .acc-tab { background: none; border: none; padding: 12px 20px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; color: #8a7e76; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
        .acc-tab.active { color: #1a1a1a; border-bottom-color: #c9a96e; }
        .acc-tab:hover:not(.active) { color: #1a1a1a; }
        .acc-signout { background: none; border: 1px solid #d4c9c0; padding: 10px 20px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: #c0392b; transition: all 0.15s; }
        .acc-signout:hover { background: #ffebee; border-color: #c0392b; }
        @media (max-width: 640px) { .acc-tabs { overflow-x: auto; } }
      `}</style>

      <div style={{ background: '#faf8f5', minHeight: '80vh' }}>
        {/* Header */}
        <div style={{ background: '#1a1a1a', padding: '40px 20px 0' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 6 }}>My Account</p>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: '#faf8f5' }}>
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.email || '').split('@')[0]}
                </h1>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#3d342c', marginTop: 4 }}>{user.email}</p>
              </div>
              <button className="acc-signout" onClick={() => { signOut(); navigate('/'); }}>Sign Out</button>
            </div>
            {/* Tabs */}
            <div className="acc-tabs" style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`acc-tab${activeSection === t.id ? ' active' : ''}`}
                  onClick={() => navigate(`/account/${t.id}`)}
                  style={{ color: activeSection === t.id ? '#faf8f5' : '#8a7e76', borderBottomColor: activeSection === t.id ? '#c9a96e' : 'transparent' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 20px 80px' }}>
          {activeSection === 'orders' && <OrdersTab orders={orders} />}
          {activeSection === 'wishlist' && <WishlistTab wishlist={wishlist} toggleWishlist={toggleWishlist} />}
          {activeSection === 'settings' && <SettingsTab user={user} updateProfile={updateProfile} />}
        </div>
      </div>
    </>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0ece8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b0a49a" strokeWidth="1.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#1a1a1a', marginBottom: 6 }}>No orders yet</p>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#5a4e46', letterSpacing: '0.1em', marginBottom: 20 }}>Your order history will appear here</p>
        <a href="/shop" style={{ background: '#1a1a1a', color: '#fafafa', padding: '13px 32px', fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>Shop Now</a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: '#1a1a1a', marginBottom: 4 }}>
        Order History
      </h2>
      {orders.map(order => {
        const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
        return (
          <div key={order.id} style={{ background: '#fff', border: '1px solid #ede5dc', padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>{order.id}</div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#3d342c' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ ...sc, padding: '4px 12px', fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 2 }}>
                  {order.status}
                </span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, color: '#1a1a1a' }}>
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#faf8f5', padding: '8px 12px', borderRadius: 2, border: '1px solid #ede5dc' }}>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10 }}>
                    <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{item.name}</span>
                    <span style={{ color: '#3d342c', marginLeft: 6 }}>{item.color} · {item.size}{item.length ? ` · ${item.length}` : ''} × {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0ece8', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, color: '#5a4e46', letterSpacing: '0.08em' }}>
                📦 {order.shippingMethod}
              </span>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, color: '#5a4e46', letterSpacing: '0.08em' }}>
                💳 {order.paymentMethod}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Wishlist Tab ─────────────────────────────────────────────────────────────
function WishlistTab({ wishlist, toggleWishlist }: { wishlist: any[]; toggleWishlist: (p: any) => void }) {
  if (wishlist.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0ece8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b0a49a" strokeWidth="1.2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, marginBottom: 6 }}>Your wishlist is empty</p>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#5a4e46', letterSpacing: '0.1em', marginBottom: 20 }}>Save items you love to find them later</p>
        <a href="/shop" style={{ background: '#1a1a1a', color: '#fafafa', padding: '13px 32px', fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>Explore Shop</a>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, marginBottom: 24, color: '#1a1a1a' }}>Wishlist ({wishlist.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {wishlist.map(({ product: p }) => (
          <div key={p.id} style={{ background: '#fff', border: '1px solid #ede5dc', overflow: 'hidden' }}>
            <a href={`/product/${p.id}`} style={{ textDecoration: 'none', display: 'block', position: 'relative' }}>
              <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f0ece8' }}>
                <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
              </div>
            </a>
            <div style={{ padding: '12px 14px 14px' }}>
              <a href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, color: '#1a1a1a', marginBottom: 4, letterSpacing: '0.04em' }}>{p.name}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: '#1a1a1a', marginBottom: 10 }}>{formatPrice(p.salePrice || p.price)}</div>
              </a>
              <button onClick={() => toggleWishlist(p)}
                style={{ width: '100%', background: 'none', border: '1px solid #d4c9c0', padding: '9px 0', fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', color: '#c0392b', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ffebee'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ user, updateProfile }: { user: any; updateProfile: any }) {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [city, setCity] = useState(user.city || '');
  const [state, setState] = useState(user.state || '');
  const [country, setCountry] = useState(user.country || '');
  const [zip, setZip] = useState(user.zip || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error } = await updateProfile({ firstName, lastName, phone, address, city, state, country, zip });
    setSaving(false);
    if (error) { setError(error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1px solid #d4c9c0',
    background: '#fff', fontFamily: "'Montserrat', sans-serif", fontSize: 12,
    color: '#1a1a1a', outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 9,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3d342c', marginBottom: 7,
  };
  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400,
    color: '#1a1a1a', marginTop: 8, marginBottom: -2,
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#c9a96e');
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#d4c9c0');

  return (
    <div style={{ maxWidth: 620 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, marginBottom: 8, color: '#1a1a1a' }}>Account Settings</h2>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#3d342c', letterSpacing: '0.04em', marginBottom: 24, lineHeight: 1.6 }}>
        These details are used to pre-fill checkout when you place an order. All fields are optional.
      </p>
      <div style={{ background: '#fff', border: '1px solid #ede5dc', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ background: '#f0ece8', padding: '12px 14px', borderRadius: 2 }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.12em', color: '#3d342c' }}>EMAIL (cannot be changed) </span>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: '#1a1a1a', marginTop: 2 }}>{user.email}</div>
        </div>

        <div style={sectionTitle}>Contact</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Phone Number</label>
          <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" onFocus={onFocus} onBlur={onBlur} />
        </div>

        <div style={sectionTitle}>Shipping Address</div>
        <div>
          <label style={labelStyle}>Street Address</label>
          <input style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="12 Akin Adesola Street" onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="Lagos" onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={labelStyle}>State / Region</label>
            <input style={inputStyle} value={state} onChange={e => setState(e.target.value)} placeholder="Lagos" onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Country</label>
            <input style={inputStyle} value={country} onChange={e => setCountry(e.target.value)} placeholder="Nigeria" onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={labelStyle}>Postal / ZIP</label>
            <input style={inputStyle} value={zip} onChange={e => setZip(e.target.value)} placeholder="100001" onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>

        {error && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#c0392b', letterSpacing: '0.03em', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ background: saving ? '#d4c9c0' : '#1a1a1a', color: '#fafafa', border: 'none', padding: '13px 32px', fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#2e7d32', letterSpacing: '0.08em' }}>✓ Saved successfully</span>}
        </div>
      </div>
    </div>
  );
}

