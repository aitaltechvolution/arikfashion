import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../data/products';
import { getSupabase } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Address {
  firstName: string; lastName: string; phone: string; phoneCode: string;
  email: string; address: string; country: string; countryCode: string;
  state: string; zip: string; city: string;
}

interface ShippingOption {
  id: string; name: string; location: string; price: number; description: string;
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'pickup', name: 'Customer Pickup', location: 'Store · Lagos', price: 0, description: 'Pick up your order directly at our store. Ready within 24 hours of confirmation.' },
  { id: 'canada', name: 'International · Canada', location: 'Canada', price: 0, description: 'This is determined by the shipping company, and you will be contacted as soon as your order gets to the shipping company. Package is measured dimensionally.' },
  { id: 'lagos', name: 'Lagos Delivery', location: 'Lagos State', price: 3500, description: 'Door-to-door delivery within Lagos. Typically 1–2 business days after dispatch.' },
  { id: 'nationwide', name: 'Nationwide Delivery', location: 'Nigeria (outside Lagos)', price: 5000, description: 'Delivered via our courier partners. 2–5 business days after dispatch, depending on location.' },
];

const COUNTRIES = [
  { name: 'Nigeria', code: 'NG', dialCode: '+234' },
  { name: 'Ghana', code: 'GH', dialCode: '+233' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Kenya', code: 'KE', dialCode: '+254' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
];

const NIGERIA_STATES: Record<string, { zip: string; cities: string[] }> = {
  'Lagos': { zip: '100001', cities: ['Ikeja', 'Lekki', 'Victoria Island', 'Surulere', 'Yaba', 'Ajah', 'Badagry'] },
  'Abuja (FCT)': { zip: '900001', cities: ['Central Business District', 'Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa'] },
  'Rivers': { zip: '500001', cities: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Okrika'] },
  'Oyo': { zip: '200001', cities: ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin'] },
  'Edo': { zip: '300001', cities: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi'] },
  'Kano': { zip: '700001', cities: ['Kano Municipal', 'Fagge', 'Gwale', 'Nasarawa'] },
  'Delta': { zip: '320001', cities: ['Asaba', 'Warri', 'Sapele', 'Ughelli'] },
  'Anambra': { zip: '420001', cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'] },
  'Enugu': { zip: '400001', cities: ['Enugu', 'Nsukka', 'Agbani', 'Udi'] },
};

const OTHER_STATES: Record<string, Record<string, { zip: string; cities: string[] }>> = {
  'GH': { 'Greater Accra': { zip: 'GA-', cities: ['Accra', 'Tema', 'Ashaiman'] }, 'Ashanti': { zip: 'AK-', cities: ['Kumasi', 'Obuasi'] } },
  'GB': { 'England': { zip: '', cities: ['London', 'Manchester', 'Birmingham', 'Leeds'] }, 'Scotland': { zip: '', cities: ['Edinburgh', 'Glasgow'] } },
  'US': { 'California': { zip: '9', cities: ['Los Angeles', 'San Francisco', 'San Diego'] }, 'New York': { zip: '1', cities: ['New York City', 'Buffalo', 'Rochester'] }, 'Texas': { zip: '7', cities: ['Houston', 'Dallas', 'Austin'] } },
  'CA': { 'Ontario': { zip: '', cities: ['Toronto', 'Ottawa', 'Hamilton'] }, 'British Columbia': { zip: '', cities: ['Vancouver', 'Victoria'] } },
};

function getStatesForCountry(countryCode: string): string[] {
  if (countryCode === 'NG') return Object.keys(NIGERIA_STATES);
  return Object.keys(OTHER_STATES[countryCode] || {});
}

function getStateData(countryCode: string, state: string) {
  if (countryCode === 'NG') return NIGERIA_STATES[state] || { zip: '', cities: [] };
  return (OTHER_STATES[countryCode] || {})[state] || { zip: '', cities: [] };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.55)', zIndex: 2000, backdropFilter: 'blur(5px)', animation: 'backdropFade 0.3s cubic-bezier(0.22,1,0.36,1)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'min(95vw, 520px)', maxHeight: '90vh', background: '#faf8f5',
        zIndex: 2100, display: 'flex', flexDirection: 'column',
        boxShadow: '0 40px 100px rgba(0,0,0,0.22)',
        animation: 'modalSlideUp 0.4s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #ede5dc', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 400, letterSpacing: '0.04em' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#1a1a1a' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </>
  );
}

function SearchSelect({ value, options, placeholder, onChange }: { value: string; options: string[]; placeholder: string; onChange: (v: string) => void; }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '11px 14px', border: '1px solid #d4c9c0',
          background: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: value ? '#1a1a1a' : '#b0a49a',
          boxSizing: 'border-box',
        }}
      >
        <span>{value || placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a7e76" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}><path d="M6 9l6 6 6-6" /></svg>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
          border: '1px solid #d4c9c0', borderTop: 'none', zIndex: 100, maxHeight: 220, overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #ede5dc' }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{ width: '100%', border: '1px solid #d4c9c0', padding: '7px 10px', fontFamily: "'Montserrat', sans-serif", fontSize: 11, outline: 'none', background: '#faf8f5', boxSizing: 'border-box' }}
            />
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '12px 14px', fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#5a4e46' }}>No results</div>
          ) : filtered.map(o => (
            <div key={o} onClick={() => { onChange(o); setOpen(false); setSearch(''); }}
              style={{ padding: '10px 14px', fontFamily: "'Montserrat', sans-serif", fontSize: 12, cursor: 'pointer', background: o === value ? '#f0ece8' : 'transparent', transition: 'background 0.1s' }}
              onMouseEnter={e => { if (o !== value) (e.target as HTMLDivElement).style.background = '#f8f5f2'; }}
              onMouseLeave={e => { if (o !== value) (e.target as HTMLDivElement).style.background = 'transparent'; }}
            >{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d342c', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#c9a96e', marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 14px', border: '1px solid #d4c9c0',
          background: '#fff', fontFamily: "'Montserrat', sans-serif", fontSize: 12,
          color: '#1a1a1a', outline: 'none', transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = '#c9a96e')}
        onBlur={e => (e.target.style.borderColor = '#d4c9c0')}
      />
    </div>
  );
}

// ─── Delivery Details Modal ──────────────────────────────────────────────────

function DeliveryModal({ initial, onSave, onClose }: { initial: Address | null; onSave: (a: Address) => void; onClose: () => void }) {
  const { user, placeOrder } = useAuth();
  const [form, setForm] = useState<Address>(initial || {
    firstName: '', lastName: '', phone: '', phoneCode: '+234',
    email: '', address: '', country: 'Nigeria', countryCode: 'NG',
    state: '', zip: '', city: '',
  });

  const hasSavedDetails = !!user && !!(
    user.firstName || user.lastName || user.phone || user.address ||
    user.city || user.state || user.country || user.zip
  );

  const applySavedDetails = () => {
    if (!user) return;
    const countryName = user.country?.trim() || '';
    const matched = COUNTRIES.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    setForm(p => ({
      ...p,
      firstName: user.firstName || p.firstName,
      lastName: user.lastName || p.lastName,
      phone: user.phone || p.phone,
      phoneCode: matched?.dialCode || p.phoneCode,
      email: user.email || p.email,
      address: user.address || p.address,
      country: matched?.name || countryName || p.country,
      countryCode: matched?.code || p.countryCode,
      state: user.state || p.state,
      city: user.city || p.city,
      zip: user.zip || p.zip,
    }));
  };

  const set = (key: keyof Address) => (v: string) => setForm(p => ({ ...p, [key]: v }));

  const handleCountry = (name: string) => {
    const c = COUNTRIES.find(c => c.name === name);
    setForm(p => ({ ...p, country: name, countryCode: c?.code || '', phoneCode: c?.dialCode || '+234', state: '', zip: '', city: '' }));
  };

  const handleState = (state: string) => {
    const data = getStateData(form.countryCode, state);
    setForm(p => ({ ...p, state, zip: data.zip, city: '' }));
  };

  const stateData = getStateData(form.countryCode, form.state);
  const states = getStatesForCountry(form.countryCode);

  const valid = form.firstName && form.lastName && form.phone && form.email && form.address && form.country && form.state;

  const handleSave = () => {
    if (!valid) return;
    onSave(form);
    onClose();
  };

  return (
    <Modal title="Delivery Details" onClose={onClose}>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {hasSavedDetails && (
          <button
            type="button"
            onClick={applySavedDetails}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '12px 14px', background: '#f4ece1',
              border: '1px solid #c9a96e', cursor: 'pointer',
              fontFamily: "'Montserrat', sans-serif", fontSize: 11,
              letterSpacing: '0.06em', color: '#6a5e56', textAlign: 'left',
              boxSizing: 'border-box',
            }}
          >
            <span>
              <strong style={{ color: '#1a1a1a', fontWeight: 700 }}>Use my saved details</strong>
              <span style={{ display: 'block', marginTop: 2, color: '#3d342c', fontSize: 10 }}>
                Auto-fill from your account profile
              </span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.6" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        )}
        {/* Name row — stack on very small screens */}
        <div className="co-name-grid">
          <FieldInput label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="Amara" required />
          <FieldInput label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Okafor" required />
        </div>

        {/* Phone with country code */}
        <div>
          <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d342c', marginBottom: 6 }}>
            Phone Number<span style={{ color: '#c9a96e', marginLeft: 3 }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 0 }}>
            <div style={{ width: 90, flexShrink: 0 }}>
              <select
                value={form.phoneCode}
                onChange={e => set('phoneCode')(e.target.value)}
                style={{ width: '100%', height: '100%', padding: '11px 6px', border: '1px solid #d4c9c0', borderRight: 'none', background: '#f0ece8', fontFamily: "'Montserrat', sans-serif", fontSize: 12, cursor: 'pointer', outline: 'none', color: '#1a1a1a' }}
              >
                {COUNTRIES.map(c => <option key={c.code} value={c.dialCode}>{c.dialCode} {c.code}</option>)}
              </select>
            </div>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone')(e.target.value)}
              placeholder="0801 234 5678"
              style={{ flex: 1, padding: '11px 14px', border: '1px solid #d4c9c0', background: '#fff', fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: '#1a1a1a', outline: 'none', minWidth: 0 }}
              onFocus={e => (e.target.style.borderColor = '#c9a96e')}
              onBlur={e => (e.target.style.borderColor = '#d4c9c0')}
            />
          </div>
        </div>

        <FieldInput label="Email Address" value={form.email} onChange={set('email')} placeholder="amara@email.com" type="email" required />
        <FieldInput label="Street Address" value={form.address} onChange={set('address')} placeholder="12 Akin Adesola Street" required />

        {/* Country */}
        <div>
          <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d342c', marginBottom: 6 }}>
            Country<span style={{ color: '#c9a96e', marginLeft: 3 }}>*</span>
          </label>
          <SearchSelect value={form.country} options={COUNTRIES.map(c => c.name)} placeholder="Select country" onChange={handleCountry} />
        </div>

        {/* State */}
        {states.length > 0 && (
          <div>
            <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d342c', marginBottom: 6 }}>
              State<span style={{ color: '#c9a96e', marginLeft: 3 }}>*</span>
            </label>
            <SearchSelect value={form.state} options={states} placeholder="Select state" onChange={handleState} />
          </div>
        )}

        {/* Zip & City row */}
        {form.state && (
          <div className="co-name-grid">
            <div>
              <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d342c', marginBottom: 6 }}>ZIP Code</label>
              <input
                value={form.zip}
                onChange={e => set('zip')(e.target.value)}
                placeholder={stateData.zip || 'ZIP'}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #d4c9c0', background: '#fff', fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                onBlur={e => (e.target.style.borderColor = '#d4c9c0')}
              />
            </div>
            {stateData.cities.length > 0 && (
              <div>
                <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3d342c', marginBottom: 6 }}>City (optional)</label>
                <SearchSelect value={form.city} options={stateData.cities} placeholder="Select city" onChange={set('city')} />
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!valid}
          style={{
            width: '100%', padding: '14px', background: valid ? '#1a1a1a' : '#d4c9c0', color: '#fafafa', border: 'none',
            fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
            cursor: valid ? 'pointer' : 'not-allowed', marginTop: 4, transition: 'background 0.2s',
          }}
        >
          Save Address
        </button>
      </div>
    </Modal>
  );
}

// ─── Shipping Modal ───────────────────────────────────────────────────────────

function ShippingModal({ selected, onSelect, onClose, options: propOptions }: { selected: string | null; onSelect: (id: string) => void; onClose: () => void; options: ShippingOption[] }) {
  const [search, setSearch] = useState('');

  const filtered = (propOptions.length > 0 ? propOptions : SHIPPING_OPTIONS).filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal title="Select Shipping Rate" onClose={onClose}>
      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a7e76" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search shipping options..."
            style={{ width: '100%', padding: '10px 14px 10px 34px', border: '1px solid #d4c9c0', background: '#fff', fontFamily: "'Montserrat', sans-serif", fontSize: 11, outline: 'none', color: '#1a1a1a', boxSizing: 'border-box' }}
            onFocus={e => (e.target.style.borderColor = '#c9a96e')}
            onBlur={e => (e.target.style.borderColor = '#d4c9c0')}
          />
        </div>

        {filtered.map(opt => {
          const isSelected = selected === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => { onSelect(opt.id); onClose(); }}
              style={{
                padding: '16px 16px 14px', border: `1px solid ${isSelected ? '#c9a96e' : '#ede5dc'}`, marginBottom: 10,
                cursor: 'pointer', background: isSelected ? '#fffdf8' : '#fff', transition: 'all 0.15s',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}
            >
              {/* Custom radio */}
              <div style={{
                width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isSelected ? '#c9a96e' : '#d4c9c0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'border-color 0.15s',
              }}>
                {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a96e' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2, gap: 8 }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: '#1a1a1a' }}>
                    {opt.name}
                  </span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 500, color: opt.price === 0 ? '#2e7d32' : '#1a1a1a', flexShrink: 0 }}>
                    {opt.price === 0 ? '₦0 · Free' : formatPrice(opt.price)}
                  </span>
                </div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#3d342c', letterSpacing: '0.06em', marginBottom: 6 }}>
                  {opt.location}
                </div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#5a4e46', lineHeight: 1.6, letterSpacing: '0.04em' }}>
                  {opt.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, placeOrder } = useAuth();
  const [address, setAddress] = useState<Address | null>(null);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'merchant' | null>(null);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  // On mobile the order summary is collapsed by default
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(SHIPPING_OPTIONS);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.from('shipping_rates')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
      .then(({ data }: any) => {
        if (data && data.length > 0) {
          setShippingOptions(data.map((r: any) => ({
            id: String(r.id),
            name: r.name,
            location: r.location || r.zone || '',
            price: Number(r.price),
            description: r.description || r.notes || '',
          })));
        }
      });
  }, []);

  const selectedShipping = shippingOptions.find(o => o.id === shippingId) || null;
  const shippingFee = selectedShipping?.price || 0;
  const discount = couponApplied ? Math.round(cartTotal * 0.1) : 0;
  const total = cartTotal + shippingFee - discount;

  const canCheckout = address && shippingId && paymentMethod;

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!canCheckout || placing) return;
    setPlacing(true);
    setPlaceError(null);

    const { orderId, error } = await placeOrder({
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        color: item.color,
        size: item.size,
        length: item.length,
        quantity: item.quantity,
        price: item.product.onSale && item.product.salePrice ? item.product.salePrice : item.product.price,
        imageUrl: item.product.images?.[0] || '',
      })),
      subtotal: cartTotal,
      shippingCost: shippingFee,
      discount,
      total,
      shippingMethod: selectedShipping?.name || shippingId || '',
      paymentMethod: paymentMethod || '',
      note: note || undefined,
      address: {
        firstName: address!.firstName,
        lastName: address!.lastName,
        phone: `${address!.phoneCode}${address!.phone}`,
        email: address!.email,
        address: address!.address,
        city: address!.city,
        state: address!.state,
        country: address!.country,
      },
    });

    setPlacing(false);
    if (error) {
      setPlaceError(error);
      return;
    }
    clearCart();
    window.scrollTo(0, 0);
    setOrderPlaced(true);
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  if (orderPlaced) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: '60px 20px', textAlign: 'center', background: '#faf8f5' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0ece8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 400, marginBottom: 8 }}>Order Placed!</p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.12em', color: '#3d342c', lineHeight: 1.7 }}>
            {paymentMethod === 'paystack'
              ? 'Your payment is being confirmed. Your order will be marked as paid within 60 seconds.'
              : "Your order is received. Please pay into the merchant's account. Your order will be confirmed after manual verification."}
          </p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          style={{ background: '#1a1a1a', color: '#fafafa', border: 'none', padding: '14px 36px', fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: '60px 20px', textAlign: 'center', background: '#faf8f5' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28 }}>Your cart is empty</p>
        <button onClick={() => navigate('/shop')} style={{ background: '#1a1a1a', color: '#fafafa', border: 'none', padding: '14px 36px', fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.18em', cursor: 'pointer' }}>Shop Now</button>
      </div>
    );
  }

  // ── Order Summary panel (shared between desktop sidebar & mobile accordion) ──
  const orderSummaryContent = (
    <>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, letterSpacing: '0.06em', marginBottom: 20, color: '#1a1a1a' }}>Your Order</h2>

      {/* Items */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5a4e46', marginBottom: 12 }}>
          <span>Product</span><span>Subtotal</span>
        </div>
        {cart.map(item => (
          <div key={`${item.product.id}-${item.color}-${item.size}`} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 12, marginBottom: 14, alignItems: 'start' }}>
            <div style={{ width: 56, height: 68, overflow: 'hidden', background: '#f0ece8', flexShrink: 0, position: 'relative' }}>
              <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat', sans-serif", fontSize: 9, fontWeight: 700 }}>
                {item.quantity}
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 600, color: '#1a1a1a', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, color: '#3d342c', letterSpacing: '0.06em' }}>
                {item.color} · {item.size}{item.length ? ` · ${item.length}` : ''}
              </div>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
              {formatPrice(item.product.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #ede5dc', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#3d342c', letterSpacing: '0.08em' }}>Subtotal</span>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{formatPrice(cartTotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#3d342c', letterSpacing: '0.08em' }}>Shipping</span>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 600, color: shippingFee === 0 && shippingId ? '#2e7d32' : '#1a1a1a' }}>
            {shippingId ? (shippingFee === 0 ? '₦0 · Free' : formatPrice(shippingFee)) : '—'}
          </span>
        </div>
        {couponApplied && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#2e7d32', letterSpacing: '0.08em' }}>Coupon (10%)</span>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 600, color: '#2e7d32' }}>−{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      {/* Coupon */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        <input
          value={coupon}
          onChange={e => { setCoupon(e.target.value); setCouponApplied(false); }}
          placeholder="Enter coupon code"
          style={{ flex: 1, minWidth: 0, padding: '11px 12px', border: '1px solid #d4c9c0', borderRight: 'none', background: '#fff', fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#1a1a1a', outline: 'none' }}
          onFocus={e => (e.target.style.borderColor = '#c9a96e')}
          onBlur={e => (e.target.style.borderColor = '#d4c9c0')}
        />
        <button
          className="co-coupon-btn"
          style={{ padding: '0 18px', background: '#1a1a1a', color: '#fff', border: 'none', fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
          onClick={() => { if (coupon.trim()) { setCouponApplied(true); } }}
        >
          Apply
        </button>
      </div>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #1a1a1a', paddingTop: 14, marginBottom: 20 }}>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Total to Pay</span>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, color: '#1a1a1a' }}>{formatPrice(total)}</span>
      </div>

      <button className="co-place-btn" disabled={!canCheckout || placing} onClick={handlePlaceOrder}>
        {placing ? 'Placing Order…' : 'Place Order'}
      </button>
      {placeError && (
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#c0392b', textAlign: 'center', marginTop: 10 }}>
          {placeError}
        </p>
      )}
      {!canCheckout && (
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.1em', color: '#5a4e46', textAlign: 'center', marginTop: 10, lineHeight: 1.7 }}>
          {!address ? 'Add delivery details · ' : ''}{!shippingId ? 'Select shipping · ' : ''}{!paymentMethod ? 'Choose payment method' : ''}
        </p>
      )}
    </>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes backdropFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 28px)); } to { opacity: 1; transform: translate(-50%, -50%); } }

        *, *::before, *::after { box-sizing: border-box; }

        .co-section-btn {
          width: 100%; border: 1.5px dashed #d4c9c0; background: #fff;
          padding: 22px 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 0.14em;
          text-transform: uppercase; color: #3d342c; transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .co-section-btn:hover { border-color: #c9a96e; color: #1a1a1a; background: #fffdf8; }
        .co-place-btn {
          width: 100%; background: #1a1a1a; color: #fafafa; border: none;
          padding: 18px; font-family: 'Montserrat', sans-serif; font-size: 12px;
          letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700;
          cursor: pointer; transition: background 0.2s;
        }
        .co-place-btn:hover:not(:disabled) { background: #c9a96e; }
        .co-place-btn:disabled { background: #d4c9c0; cursor: not-allowed; }
        .co-payment-option {
          flex: 1; padding: 14px 16px; border: 1.5px solid #d4c9c0; background: #fff;
          cursor: pointer; font-family: 'Montserrat', sans-serif; font-size: 10px;
          letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; transition: all 0.2s; text-align: center;
        }
        .co-payment-option.active { border-color: #c9a96e; background: #fffdf8; color: #1a1a1a; }
        .co-payment-option:not(.active):hover { border-color: #b0a49a; }
        .co-coupon-btn:hover { background: #c9a96e; }
        .co-change-link {
          background: none; border: none; cursor: pointer;
          font-family: 'Montserrat', sans-serif; font-size: 9px; letter-spacing: 0.12em;
          text-transform: uppercase; text-decoration: underline; color: #c9a96e;
          padding: 0;
        }

        /* Two-column name/zip grid that collapses on small screens */
        .co-name-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        /* Main layout: two-column on ≥768 px, single-column below */
        .co-layout {
          max-width: 1060px;
          margin: 0 auto;
          padding: 0 16px;
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(0,420px);
          gap: 32px;
          align-items: start;
        }

        /* Desktop order summary sidebar */
        .co-summary-desktop {
          background: #fff;
          border: 1px solid #ede5dc;
          padding: 24px 22px;
          position: sticky;
          top: 100px;
        }

        /* Mobile order summary accordion – hidden on desktop */
        .co-summary-mobile { display: none; }

        @media (max-width: 767px) {
          .co-layout {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 0 14px;
          }

          /* Hide the sticky sidebar on mobile */
          .co-summary-desktop { display: none; }

          /* Show the accordion instead, and put it ABOVE the form steps */
          .co-summary-mobile {
            display: block;
            order: -1;
            background: #fff;
            border: 1px solid #ede5dc;
          }

          .co-summary-mobile-toggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 18px;
            cursor: pointer;
            background: none;
            border: none;
            width: 100%;
            text-align: left;
          }

          .co-summary-mobile-body {
            padding: 0 18px 18px;
          }

          /* Stack name grid to single column on very small phones */
          .co-name-grid {
            grid-template-columns: 1fr;
          }

          .co-payment-option {
            padding: 12px 10px;
            font-size: 9px;
          }
        }

        @media (max-width: 400px) {
          .co-layout { padding: 0 10px; }
        }
      `}</style>

      <div style={{ background: '#faf8f5', minHeight: '100vh', paddingTop: 32, paddingBottom: 80 }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 400, letterSpacing: '0.06em', color: '#1a1a1a' }}>Checkout</h1>
          <div style={{ width: 40, height: 1, background: '#c9a96e', margin: '10px auto 0' }} />
        </div>

        <div className="co-layout">

          {/* ── MOBILE ORDER SUMMARY ACCORDION ── */}
          <div className="co-summary-mobile">
            <button
              className="co-summary-mobile-toggle"
              onClick={() => setSummaryOpen(v => !v)}
            >
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, letterSpacing: '0.04em', color: '#1a1a1a' }}>
                Order Summary
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#5a4e46', marginLeft: 10 }}>
                  ({cart.length} {cart.length === 1 ? 'item' : 'items'}) · {formatPrice(total)}
                </span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a7e76" strokeWidth="2" style={{ transform: summaryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', flexShrink: 0 }}><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {summaryOpen && (
              <div className="co-summary-mobile-body">
                {orderSummaryContent}
              </div>
            )}
          </div>

          {/* ── LEFT COLUMN: form steps ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* 1. Delivery Details */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>
                  1 · Delivery Details
                </h2>
                {address && <button className="co-change-link" onClick={() => setShowDelivery(true)}>Change</button>}
              </div>

              {address ? (
                <div style={{ background: '#fff', border: '1px solid #ede5dc', padding: '18px 20px' }}>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
                    {address.firstName} {address.lastName}
                  </div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#3d342c', lineHeight: 1.7 }}>
                    <div>{address.phone}</div>
                    <div>{address.email}</div>
                    <div>{address.address}</div>
                    <div>{[address.city, address.state, address.country].filter(Boolean).join(', ')}{address.zip ? ` · ${address.zip}` : ''}</div>
                  </div>
                </div>
              ) : (
                <button className="co-section-btn" onClick={() => setShowDelivery(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
                  Add delivery details
                </button>
              )}
            </div>

            {/* 2. Note for merchant */}
            <div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: 12 }}>
                2 · Note for Merchant
              </h2>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Any extra note for the merchant..."
                rows={4}
                style={{
                  width: '100%', padding: '14px 16px', border: '1px solid #d4c9c0', background: '#fff',
                  fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: '#1a1a1a', outline: 'none',
                  resize: 'vertical', lineHeight: 1.6, transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                onBlur={e => (e.target.style.borderColor = '#d4c9c0')}
              />
            </div>

            {/* 3. Shipping Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>
                  3 · Shipping Rate
                </h2>
                {selectedShipping && <button className="co-change-link" onClick={() => setShowShipping(true)}>Change</button>}
              </div>

              {selectedShipping ? (
                <div style={{ background: '#fff', border: '1px solid #ede5dc', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>
                        {selectedShipping.name}
                      </div>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#3d342c', marginBottom: 6 }}>{selectedShipping.location}</div>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#5a4e46', lineHeight: 1.6 }}>{selectedShipping.description}</div>
                    </div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: selectedShipping.price === 0 ? '#2e7d32' : '#1a1a1a', flexShrink: 0 }}>
                      {selectedShipping.price === 0 ? 'Free' : formatPrice(selectedShipping.price)}
                    </span>
                  </div>
                </div>
              ) : (
                <button className="co-section-btn" onClick={() => setShowShipping(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                  Select a shipping rate
                </button>
              )}
            </div>

            {/* 4. Payment Method */}
            <div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: 12 }}>
                4 · Payment Method
              </h2>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <button className={`co-payment-option${paymentMethod === 'paystack' ? ' active' : ''}`} onClick={() => setPaymentMethod('paystack')}>
                  <div style={{ marginBottom: 4 }}>
                    <svg width="80" height="20" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <text x="0" y="22" fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill={paymentMethod === 'paystack' ? '#c9a96e' : '#8a7e76'}>Paystack</text>
                    </svg>
                  </div>
                  Pay with Paystack
                </button>
                <button className={`co-payment-option${paymentMethod === 'merchant' ? ' active' : ''}`} onClick={() => setPaymentMethod('merchant')}>
                  <div style={{ marginBottom: 4 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === 'merchant' ? '#c9a96e' : '#8a7e76'} strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  Merchant Account
                </button>
              </div>

              {paymentMethod === 'paystack' && (
                <div style={{ background: '#fffdf8', border: '1px solid #e8dcc8', padding: '16px 18px', animation: 'fadeUp 0.2s ease' }}>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 600, color: '#1a1a1a', marginBottom: 8, letterSpacing: '0.06em' }}>Pay with Paystack</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {['Card', 'Bank Transfer', 'USSD', 'Wallet'].map(m => (
                      <span key={m} style={{ background: '#f0ece8', padding: '4px 10px', fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3d342c' }}>{m}</span>
                    ))}
                  </div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#3d342c', lineHeight: 1.7, letterSpacing: '0.04em' }}>
                    Payment is confirmed within <strong style={{ color: '#1a1a1a' }}>60 seconds</strong>, and your order is automatically marked as paid.
                  </p>
                </div>
              )}
              {paymentMethod === 'merchant' && (
                <div style={{ background: '#fdf8f5', border: '1px solid #ede5dc', padding: '16px 18px', animation: 'fadeUp 0.2s ease' }}>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 600, color: '#1a1a1a', marginBottom: 8, letterSpacing: '0.06em' }}>Pay into Merchant Account</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#3d342c', lineHeight: 1.7, letterSpacing: '0.04em' }}>
                    Transfer the total amount to the merchant's bank account. This payment is <strong style={{ color: '#1a1a1a' }}>not confirmed automatically</strong> and requires manual confirmation by the merchant. You will be notified once confirmed.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Order Summary (desktop only) ── */}
          <div className="co-summary-desktop">
            {orderSummaryContent}
          </div>

        </div>
      </div>

      {/* Modals */}
      {showDelivery && <DeliveryModal initial={address} onSave={setAddress} onClose={() => setShowDelivery(false)} />}
      {showShipping && <ShippingModal selected={shippingId} onSelect={setShippingId} onClose={() => setShowShipping(false)} options={shippingOptions} />}
    </>
  );
}