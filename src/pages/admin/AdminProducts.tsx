import React, { useEffect, useState } from 'react';
import AdminLayout, { th, td, btn, btnGhost, badge, input } from './AdminLayout';
import { getSupabase } from '../../lib/supabase';

export default function AdminProducts() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  async function load() {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.from('products').select('*').order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const sb = getSupabase(); if (!sb) return;
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) alert(error.message); else load();
  }

  async function togglePublish(p: any) {
    const sb = getSupabase(); if (!sb) return;
    await sb.from('products').update({ is_published: !p.is_published }).eq('id', p.id);
    load();
  }

  const filtered = rows.filter(r =>
    !q || (r.name || '').toLowerCase().includes(q.toLowerCase()) || (r.sku || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AdminLayout title="Products" subtitle={`${rows.length} total`} currentPath="/admin/products">
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name or SKU…"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ ...input, maxWidth: 320 }}
        />
        <div style={{ flex: 1 }} />
        <a href="/admin/products/new" style={{ ...btn, textDecoration: 'none', display: 'inline-block' }}>+ New product</a>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e5e0', borderRadius: 4, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead><tr>
            <th style={th}></th>
            <th style={th}>Name</th>
            <th style={th}>SKU</th>
            <th style={th}>Price</th>
            <th style={th}>Stock</th>
            <th style={th}>Status</th>
            <th style={th}></th>
          </tr></thead>
          <tbody>
            {loading && <tr><td style={td} colSpan={7}>Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td style={td} colSpan={7}>No products.</td></tr>}
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={td}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 2 }} />
                    : <div style={{ width: 48, height: 60, background: '#f0f0ed' }} />
                  }
                </td>
                <td style={td}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{p.category}</div>
                </td>
                <td style={td}>{p.sku || '—'}</td>
                <td style={td}>₦{Number(p.price).toLocaleString()}</td>
                <td style={td} ><span style={{ color: p.stock === 0 ? '#b91c1c' : '#0a0a0a' }}>{p.stock}</span></td>
                <td style={td}>
                  {p.is_published
                    ? <span style={badge('#15803d')}>Live</span>
                    : <span style={badge('#777')}>Draft</span>}
                </td>
                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <a href={`/admin/products/${p.id}`} style={{ ...btnGhost, textDecoration: 'none', marginRight: 6, padding: '6px 12px', fontSize: 11 }}>Edit</a>
                  <button onClick={() => togglePublish(p)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 11, marginRight: 6 }}>{p.is_published ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={() => remove(p.id)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 11, borderColor: '#b91c1c', color: '#b91c1c' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
