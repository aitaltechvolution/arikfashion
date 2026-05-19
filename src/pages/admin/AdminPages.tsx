import React, { useEffect, useState } from 'react';
import AdminLayout, { th, td, btn, btnGhost, badge, input, card, label } from './AdminLayout';
import { getSupabase } from '../../lib/supabase';

const STATUS_COLORS: Record<string, string> = {
  pending: '#a16207', confirmed: '#1d4ed8', processing: '#7c3aed',
  shipped: '#0891b2', delivered: '#15803d', cancelled: '#b91c1c',
};
const PAY_COLORS: Record<string, string> = {
  pending: '#a16207', paid: '#15803d', failed: '#b91c1c', refunded: '#777',
};

export function AdminOrders() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    sb.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setRows(data || []));
  }, []);
  const shown = filter === 'all' ? rows : rows.filter(o => o.status === filter);

  return (
    <AdminLayout title="Orders" subtitle={`${rows.length} total`} currentPath="/admin/orders">
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            ...btnGhost, background: filter === s ? '#0a0a0a' : '#fff', color: filter === s ? '#fff' : '#0a0a0a',
            padding: '8px 14px', fontSize: 11,
          }}>{s} {s === 'all' ? `(${rows.length})` : `(${rows.filter(o => o.status === s).length})`}</button>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e5e0', borderRadius: 4, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead><tr>
            <th style={th}>Order</th><th style={th}>Date</th><th style={th}>Customer</th>
            <th style={th}>Total</th><th style={th}>Payment</th><th style={th}>Status</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {shown.map(o => (
              <tr key={o.id}>
                <td style={td}>{o.order_number || o.id.slice(0,8)}</td>
                <td style={td}>{new Date(o.created_at).toLocaleDateString()}</td>
                <td style={td}>{o.customer_email || o.address?.email || '—'}</td>
                <td style={td}>₦{Number(o.total).toLocaleString()}</td>
                <td style={td}><span style={badge(PAY_COLORS[o.payment_status] || '#777')}>{o.payment_status}</span></td>
                <td style={td}><span style={badge(STATUS_COLORS[o.status] || '#777')}>{o.status}</span></td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <a href={`/admin/orders/${o.id}`} style={{ ...btnGhost, textDecoration: 'none', padding: '6px 12px', fontSize: 11 }}>Manage</a>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td style={td} colSpan={7}>No orders.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    sb.from('orders').select('*').eq('id', orderId).single().then(({ data }) => setOrder(data));
  }, [orderId]);

  async function update(patch: any) {
    const sb = getSupabase(); if (!sb || !order) return;
    setSaving(true);
    const { data, error } = await sb.from('orders').update(patch).eq('id', orderId).select('*').single();
    setSaving(false);
    if (error) alert(error.message); else setOrder(data);
  }

  if (!order) return <AdminLayout title="Order" currentPath="/admin/orders"><p>Loading…</p></AdminLayout>;
  const items = order.items || [];

  return (
    <AdminLayout title={order.order_number || `Order ${order.id.slice(0, 8)}`} subtitle={new Date(order.created_at).toLocaleString()} currentPath="/admin/orders">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="ord-cols">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h3 style={sec}>Items</h3>
            {items.map((it: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', padding: '10px 0', borderBottom: '1px solid #efefea', fontSize: 14 }}>
                <span>{it.name}<div style={{ color: '#888', fontSize: 12 }}>{[it.color, it.size, it.length].filter(Boolean).join(' · ')}</div></span>
                <span>× {it.quantity}</span>
                <span style={{ textAlign: 'right' }}>₦{Number(it.price * it.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontFamily: 'Cormorant Garamond, serif', fontSize: 22 }}>
              <span>Total</span><span>₦{Number(order.total).toLocaleString()}</span>
            </div>
          </div>
          <div style={card}>
            <h3 style={sec}>Shipping address</h3>
            <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', fontSize: 14, color: '#333' }}>
{order.address?.firstName} {order.address?.lastName}{'\n'}
{order.address?.address}{'\n'}
{order.address?.city}, {order.address?.state}, {order.address?.country}{'\n'}
{order.address?.phone} · {order.address?.email}
            </pre>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h3 style={sec}>Order status</h3>
            <select value={order.status} onChange={e => update({ status: e.target.value })} style={input}>
              {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={card}>
            <h3 style={sec}>Payment</h3>
            <label style={label}>Status</label>
            <select value={order.payment_status} onChange={e => update({ payment_status: e.target.value })} style={input}>
              {['pending','paid','failed','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label style={{ ...label, marginTop: 12 }}>Reference</label>
            <input style={input} defaultValue={order.payment_ref || ''} onBlur={e => update({ payment_ref: e.target.value })} />
          </div>
          <div style={card}>
            <h3 style={sec}>Tracking</h3>
            <label style={label}>Number</label>
            <input style={input} defaultValue={order.tracking_number || ''} onBlur={e => update({ tracking_number: e.target.value })} />
            <label style={{ ...label, marginTop: 12 }}>URL</label>
            <input style={input} defaultValue={order.tracking_url || ''} onBlur={e => update({ tracking_url: e.target.value })} />
          </div>
          <div style={card}>
            <h3 style={sec}>Internal note</h3>
            <textarea style={{ ...input, minHeight: 90 }} defaultValue={order.admin_note || ''} onBlur={e => update({ admin_note: e.target.value })} />
          </div>
          {saving && <p style={{ fontSize: 12, color: '#888' }}>Saving…</p>}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px){.ord-cols{grid-template-columns:1fr !important;}}` }} />
    </AdminLayout>
  );
}

export function AdminCustomers() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    sb.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []));
  }, []);
  async function setRole(id: string, role: string) {
    const sb = getSupabase(); if (!sb) return;
    const { error } = await sb.from('profiles').update({ role }).eq('id', id);
    if (error) alert(error.message);
    else setRows(rs => rs.map(r => r.id === id ? { ...r, role } : r));
  }
  return (
    <AdminLayout title="Customers" subtitle={`${rows.length} accounts`} currentPath="/admin/customers">
      <div style={{ background: '#fff', border: '1px solid #e5e5e0', borderRadius: 4, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead><tr>
            <th style={th}>Name</th><th style={th}>Email</th><th style={th}>Phone</th>
            <th style={th}>Joined</th><th style={th}>Role</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id}>
                <td style={td}>{[p.first_name, p.last_name].filter(Boolean).join(' ') || '—'}</td>
                <td style={td}>{p.email}</td>
                <td style={td}>{p.phone || '—'}</td>
                <td style={td}>{new Date(p.created_at).toLocaleDateString()}</td>
                <td style={td}><span style={badge(p.role === 'admin' ? '#0a0a0a' : '#777')}>{p.role}</span></td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {p.role === 'admin'
                    ? <button onClick={() => setRole(p.id, 'customer')} style={{ ...btnGhost, padding: '6px 12px', fontSize: 11 }}>Demote</button>
                    : <button onClick={() => setRole(p.id, 'admin')} style={{ ...btnGhost, padding: '6px 12px', fontSize: 11 }}>Make admin</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export function AdminEnquiries() {
  const [rows, setRows] = useState<any[]>([]);
  async function load() {
    const sb = getSupabase(); if (!sb) return;
    const { data } = await sb.from('contact_messages').select('*').order('created_at', { ascending: false });
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);
  async function setStatus(id: string, status: string) {
    const sb = getSupabase(); if (!sb) return;
    await sb.from('contact_messages').update({ status }).eq('id', id);
    load();
  }
  return (
    <AdminLayout title="Enquiries" subtitle={`${rows.length} messages`} currentPath="/admin/enquiries">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.length === 0 && <p style={{ color: '#888' }}>No messages yet.</p>}
        {rows.map(m => (
          <div key={m.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <strong style={{ fontSize: 16 }}>{m.name}</strong>
                <span style={{ color: '#888', marginLeft: 8, fontSize: 13 }}>{m.email}{m.phone ? ` · ${m.phone}` : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={badge(m.status === 'unread' ? '#a16207' : m.status === 'replied' ? '#15803d' : '#777')}>{m.status}</span>
                <span style={{ color: '#888', fontSize: 12 }}>{new Date(m.created_at).toLocaleString()}</span>
              </div>
            </div>
            {m.subject && <div style={{ fontWeight: 500, marginTop: 8 }}>{m.subject}</div>}
            <p style={{ marginTop: 8, color: '#333', whiteSpace: 'pre-wrap' }}>{m.message}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your enquiry')}`} style={{ ...btn, textDecoration: 'none' }}>Email reply</a>
              {m.phone && (
                <a href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" style={{ ...btnGhost, textDecoration: 'none' }}>WhatsApp</a>
              )}
              {m.status !== 'replied' && <button onClick={() => setStatus(m.id, 'replied')} style={btnGhost}>Mark replied</button>}
              {m.status !== 'resolved' && <button onClick={() => setStatus(m.id, 'resolved')} style={btnGhost}>Resolve</button>}
              {m.status === 'unread' && <button onClick={() => setStatus(m.id, 'read')} style={btnGhost}>Mark read</button>}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export function AdminReviews() {
  const [rows, setRows] = useState<any[]>([]);
  async function load() {
    const sb = getSupabase(); if (!sb) return;
    const { data } = await sb.from('reviews').select('*, products(name)').order('created_at', { ascending: false });
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);
  async function toggle(id: string, approved: boolean) {
    const sb = getSupabase(); if (!sb) return;
    await sb.from('reviews').update({ is_approved: !approved }).eq('id', id);
    load();
  }
  return (
    <AdminLayout title="Reviews" subtitle="You can hide a review but not delete it" currentPath="/admin/reviews">
      <div style={{ background: '#fff', border: '1px solid #e5e5e0', borderRadius: 4, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead><tr>
            <th style={th}>Product</th><th style={th}>Reviewer</th><th style={th}>Rating</th>
            <th style={th}>Comment</th><th style={th}>Visible</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={td}>{r.products?.name || '—'}</td>
                <td style={td}>{r.user_name || '—'}</td>
                <td style={td}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                <td style={td}><div style={{ maxWidth: 360, color: '#333' }}>{r.comment}</div></td>
                <td style={td}><span style={badge(r.is_approved ? '#15803d' : '#b91c1c')}>{r.is_approved ? 'shown' : 'hidden'}</span></td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button onClick={() => toggle(r.id, r.is_approved)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 11 }}>
                    {r.is_approved ? 'Hide' : 'Show'}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td style={td} colSpan={6}>No reviews.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export function AdminShipping() {
  const [rows, setRows] = useState<any[]>([]);
  async function load() {
    const sb = getSupabase(); if (!sb) return;
    const { data } = await sb.from('shipping_rates').select('*').order('sort_order', { ascending: true });
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save(r: any) {
    const sb = getSupabase(); if (!sb) return;
    const { id, ...patch } = r;
    if (id) await sb.from('shipping_rates').update(patch).eq('id', id);
    else await sb.from('shipping_rates').insert(patch);
    load();
  }
  async function del(id: string) {
    if (!confirm('Delete this rate?')) return;
    const sb = getSupabase(); if (!sb) return;
    await sb.from('shipping_rates').delete().eq('id', id);
    load();
  }

  return (
    <AdminLayout title="Shipping" subtitle="Rates shown at checkout" currentPath="/admin/shipping">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.map(r => <RateRow key={r.id} row={r} onSave={save} onDelete={del} />)}
        <RateRow row={{ name: '', description: '', zone: 'nationwide', country: 'NG', price: 0, is_active: true, sort_order: rows.length + 1 }} onSave={save} isNew />
      </div>
    </AdminLayout>
  );
}
function RateRow({ row, onSave, onDelete, isNew }: { row: any; onSave: (r: any) => void; onDelete?: (id: string) => void; isNew?: boolean }) {
  const [r, setR] = useState(row);
  useEffect(() => { setR(row); }, [row.id]);
  return (
    <div style={card}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 80px', gap: 10, alignItems: 'end' }} className="ship-row">
        <div><label style={label}>Name</label><input style={input} value={r.name} onChange={e => setR({ ...r, name: e.target.value })} /></div>
        <div><label style={label}>Zone</label>
          <select style={input} value={r.zone} onChange={e => setR({ ...r, zone: e.target.value })}>
            {['pickup','lagos','nationwide','international'].map(z => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div><label style={label}>Country</label><input style={input} value={r.country || ''} onChange={e => setR({ ...r, country: e.target.value })} /></div>
        <div><label style={label}>Price (₦)</label><input style={input} type="number" value={r.price} onChange={e => setR({ ...r, price: e.target.value })} /></div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onSave({ ...r, price: Number(r.price), sort_order: Number(r.sort_order) })} style={{ ...btn, padding: '8px 10px', fontSize: 11 }}>{isNew ? 'Add' : 'Save'}</button>
          {!isNew && onDelete && <button onClick={() => onDelete(r.id)} style={{ ...btnGhost, padding: '8px 10px', fontSize: 11, borderColor: '#b91c1c', color: '#b91c1c' }}>✕</button>}
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <label style={label}>Description (shown at checkout)</label>
        <input style={input} value={r.description || ''} onChange={e => setR({ ...r, description: e.target.value })} />
      </div>
      <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginTop: 10, fontSize: 13 }}>
        <input type="checkbox" checked={!!r.is_active} onChange={e => setR({ ...r, is_active: e.target.checked })} /> Active
      </label>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width:760px){.ship-row{grid-template-columns:1fr !important;}}` }} />
    </div>
  );
}

export function AdminDiscounts() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ code: '', kind: 'percent', amount: 10, expires_at: '', usage_limit: 0, is_active: true });
  async function load() {
    const sb = getSupabase(); if (!sb) return;
    const { data } = await sb.from('discount_codes').select('*').order('created_at', { ascending: false });
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);
  async function create() {
    const sb = getSupabase(); if (!sb || !form.code) return;
    const payload: any = { ...form, amount: Number(form.amount), usage_limit: Number(form.usage_limit) || null, expires_at: form.expires_at || null };
    const { error } = await sb.from('discount_codes').insert(payload);
    if (error) alert(error.message);
    else { setForm({ code: '', kind: 'percent', amount: 10, expires_at: '', usage_limit: 0, is_active: true }); load(); }
  }
  async function toggle(r: any) {
    const sb = getSupabase(); if (!sb) return;
    await sb.from('discount_codes').update({ is_active: !r.is_active }).eq('id', r.id);
    load();
  }
  async function del(id: string) {
    if (!confirm('Delete this code?')) return;
    const sb = getSupabase(); if (!sb) return;
    await sb.from('discount_codes').delete().eq('id', id);
    load();
  }
  return (
    <AdminLayout title="Discounts" subtitle="Promo codes applied at checkout" currentPath="/admin/discounts">
      <div style={{ ...card, marginBottom: 18 }}>
        <h3 style={sec}>Create code</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 100px', gap: 10, alignItems: 'end' }} className="disc-row">
          <div><label style={label}>Code</label><input style={input} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="ARIK10" /></div>
          <div><label style={label}>Type</label>
            <select style={input} value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}>
              <option value="percent">Percent (%)</option><option value="fixed">Fixed (₦)</option>
            </select>
          </div>
          <div><label style={label}>Amount</label><input style={input} type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
          <div><label style={label}>Expires</label><input style={input} type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} /></div>
          <div><label style={label}>Usage limit</label><input style={input} type="number" value={form.usage_limit} onChange={e => setForm({ ...form, usage_limit: Number(e.target.value) })} placeholder="0 = unlimited" /></div>
          <button onClick={create} style={{ ...btn, padding: '10px' }}>Add</button>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@media (max-width:760px){.disc-row{grid-template-columns:1fr !important;}}` }} />
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e5e0', borderRadius: 4, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead><tr>
            <th style={th}>Code</th><th style={th}>Type</th><th style={th}>Amount</th>
            <th style={th}>Used</th><th style={th}>Expires</th><th style={th}>Status</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={td}><strong>{r.code}</strong></td>
                <td style={td}>{r.kind}</td>
                <td style={td}>{r.kind === 'percent' ? `${r.amount}%` : `₦${Number(r.amount).toLocaleString()}`}</td>
                <td style={td}>{r.used_count || 0}{r.usage_limit ? ` / ${r.usage_limit}` : ''}</td>
                <td style={td}>{r.expires_at ? new Date(r.expires_at).toLocaleDateString() : '—'}</td>
                <td style={td}><span style={badge(r.is_active ? '#15803d' : '#777')}>{r.is_active ? 'active' : 'paused'}</span></td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button onClick={() => toggle(r)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 11, marginRight: 6 }}>{r.is_active ? 'Pause' : 'Activate'}</button>
                  <button onClick={() => del(r.id)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 11, borderColor: '#b91c1c', color: '#b91c1c' }}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td style={td} colSpan={7}>No codes yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export function AdminSettings() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    sb.from('site_settings').select('*').then(({ data }) => {
      const m: Record<string, string> = {};
      (data || []).forEach((r: any) => { m[r.key] = r.value; });
      setData(m); setLoaded(true);
    });
  }, []);
  function set(k: string, v: string) { setData(d => ({ ...d, [k]: v })); }
  async function save() {
    const sb = getSupabase(); if (!sb) return;
    const rows = Object.entries(data).map(([key, value]) => ({ key, value }));
    const { error } = await sb.from('site_settings').upsert(rows, { onConflict: 'key' });
    if (error) alert(error.message); else alert('Saved.');
  }
  if (!loaded) return <AdminLayout title="Settings" currentPath="/admin/settings"><p>Loading…</p></AdminLayout>;
  const fields: { key: string; label: string; ml?: boolean }[] = [
    { key: 'marquee_text', label: 'Marquee text (top bar)' },
    { key: 'hero_eyebrow', label: 'Hero — eyebrow' },
    { key: 'hero_title', label: 'Hero — title', ml: true },
    { key: 'hero_subtitle', label: 'Hero — subtitle', ml: true },
    { key: 'whatsapp_number', label: 'WhatsApp number (with country code)' },
    { key: 'contact_email', label: 'Contact email' },
    { key: 'contact_phone', label: 'Contact phone' },
    { key: 'instagram_url', label: 'Instagram URL' },
    { key: 'tiktok_url', label: 'TikTok URL' },
    { key: 'address_line', label: 'Store address' },
  ];
  return (
    <AdminLayout title="Site settings" subtitle="Storefront content" currentPath="/admin/settings">
      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={label}>{f.label}</label>
            {f.ml
              ? <textarea style={{ ...input, minHeight: 80 }} value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
              : <input style={input} value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
            }
          </div>
        ))}
        <button onClick={save} style={{ ...btn, alignSelf: 'flex-start', marginTop: 8 }}>Save settings</button>
      </div>
    </AdminLayout>
  );
}

const sec: React.CSSProperties = { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, marginBottom: 14, fontWeight: 400 };
