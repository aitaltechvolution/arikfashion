import React, { useEffect, useState } from 'react';
import AdminLayout, { card } from './AdminLayout';
import { getSupabase } from '../../lib/supabase';

interface Stats {
  pending_orders: number;
  processing_orders: number;
  orders_this_week: number;
  total_revenue: number;
  live_products: number;
  out_of_stock: number;
  unread_messages: number;
  total_customers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.from('admin_summary').select('*').single().then(({ data }) => setStats(data as any));
    sb.from('orders').select('id, order_number, total, status, created_at, customer_email')
      .order('created_at', { ascending: false }).limit(8).then(({ data }) => setRecent(data || []));
    sb.from('low_stock_products').select('*').limit(8).then(({ data }) => setLowStock(data || []));
  }, []);

  const tiles = [
    { label: 'Revenue (paid)', value: stats ? `₦${Number(stats.total_revenue).toLocaleString()}` : '—', tint: '#0a0a0a' },
    { label: 'Pending orders', value: stats?.pending_orders ?? '—', tint: '#c2410c' },
    { label: 'Orders this week', value: stats?.orders_this_week ?? '—', tint: '#0a0a0a' },
    { label: 'Customers', value: stats?.total_customers ?? '—', tint: '#0a0a0a' },
    { label: 'Live products', value: stats?.live_products ?? '—', tint: '#0a0a0a' },
    { label: 'Out of stock', value: stats?.out_of_stock ?? '—', tint: '#b91c1c' },
    { label: 'Unread enquiries', value: stats?.unread_messages ?? '—', tint: '#a16207' },
    { label: 'Processing', value: stats?.processing_orders ?? '—', tint: '#1d4ed8' },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="At a glance — your store today" currentPath="/admin">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {tiles.map(t => (
          <div key={t.label} style={{ ...card, padding: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888' }}>{t.label}</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, marginTop: 8, color: t.tint }}>{t.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="dash-cols">
        <div style={card}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, marginBottom: 14 }}>Recent orders</h3>
          {recent.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>No orders yet.</p>}
          {recent.map(o => (
            <a key={o.id} href={`/admin/orders/${o.id}`} style={{
              display: 'grid', gridTemplateColumns: '120px 1fr 90px 100px',
              padding: '12px 0', borderBottom: '1px solid #efefea', textDecoration: 'none', color: '#0a0a0a', fontSize: 14,
            }}>
              <span style={{ color: '#888' }}>{o.order_number || o.id.slice(0, 8)}</span>
              <span>{o.customer_email || '—'}</span>
              <span>₦{Number(o.total).toLocaleString()}</span>
              <span style={{ textTransform: 'capitalize', color: '#555' }}>{o.status}</span>
            </a>
          ))}
        </div>
        <div style={card}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, marginBottom: 14 }}>Low stock</h3>
          {lowStock.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>All products stocked.</p>}
          {lowStock.map(p => (
            <a key={p.id} href={`/admin/products/${p.id}`} style={{
              display: 'flex', justifyContent: 'space-between', padding: '10px 0',
              borderBottom: '1px solid #efefea', textDecoration: 'none', color: '#0a0a0a', fontSize: 14,
            }}>
              <span>{p.name}</span>
              <span style={{ color: p.stock === 0 ? '#b91c1c' : '#a16207', fontWeight: 600 }}>{p.stock}</span>
            </a>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px){.dash-cols{grid-template-columns:1fr !important;}}` }} />
    </AdminLayout>
  );
}
