import React, { useEffect, useRef, useState } from 'react';
import AdminLayout, { card, label, input, btn, btnGhost } from './AdminLayout';
import { getSupabase, publicImageUrl } from '../../lib/supabase';
import { compressImage, safeFileName } from '../../lib/imageCompress';

interface Props { productId: string; }

const BLANK = {
  name: '', slug: '', description: '', category: 'Dresses', sku: '',
  price: 0, sale_price: null as number | null, on_sale: false,
  colors: [] as string[], sizes: [] as string[], lengths: [] as string[],
  images: [] as string[], stock: 0,
  is_new: false, is_featured: false, is_published: true,
  tags: [] as string[], weight_grams: null as number | null,
};

/** Controlled input that lets the user type freely (including commas),
 *  only converting to/from the string[] on mount and onBlur. */
function CsvInput({
  value, onChange, placeholder,
}: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [raw, setRaw] = useState(() => value.join(', '));

  // Keep raw in sync if the parent value changes from outside (e.g. load from DB)
  const lastParent = useRef(value);
  useEffect(() => {
    if (lastParent.current !== value) {
      lastParent.current = value;
      setRaw(value.join(', '));
    }
  }, [value]);

  const commit = () => {
    const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
    lastParent.current = arr;
    onChange(arr);
  };

  return (
    <input
      style={input}
      value={raw}
      placeholder={placeholder}
      onChange={e => setRaw(e.target.value)}
      onBlur={commit}
    />
  );
}

export default function AdminProductEdit({ productId }: Props) {
  const isNew = productId === 'new';
  const [form, setForm] = useState<any>(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    const sb = getSupabase(); if (!sb) return;
    sb.from('products').select('*').eq('id', productId).single().then(({ data }) => {
      if (data) setForm(data);
      setLoading(false);
    });
  }, [productId, isNew]);

  function set<K extends keyof typeof BLANK>(k: K, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const sb = getSupabase(); if (!sb) { alert('Supabase not configured'); return; }
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const blob = await compressImage(file);
        const name = safeFileName(file.name);
        const { error } = await sb.storage.from('product-images').upload(name, blob, { contentType: 'image/jpeg', upsert: false });
        if (error) { console.error(error); alert(`Upload failed: ${error.message}`); continue; }
        newUrls.push(publicImageUrl(name));
      } catch (e: any) { console.error(e); alert(`Image failed: ${e.message}`); }
    }
    set('images', [...(form.images || []), ...newUrls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const imgs = [...(form.images || [])];
    const j = idx + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[idx], imgs[j]] = [imgs[j], imgs[idx]];
    set('images', imgs);
  }
  function makePrimary(idx: number) {
    const imgs = [...(form.images || [])];
    const [pick] = imgs.splice(idx, 1);
    imgs.unshift(pick);
    set('images', imgs);
  }
  function removeImage(idx: number) {
    const imgs = [...(form.images || [])];
    imgs.splice(idx, 1);
    set('images', imgs);
  }

  async function save() {
    const sb = getSupabase(); if (!sb) return;
    setSaving(true);
    const payload: any = {
      name: form.name, slug: form.slug || null, description: form.description, category: form.category, sku: form.sku || null,
      price: Number(form.price), sale_price: form.sale_price ? Number(form.sale_price) : null, on_sale: !!form.on_sale,
      colors: form.colors, sizes: form.sizes, lengths: form.lengths, images: form.images,
      stock: Number(form.stock) || 0, is_new: !!form.is_new, is_featured: !!form.is_featured, is_published: !!form.is_published,
      tags: form.tags, weight_grams: form.weight_grams ? Number(form.weight_grams) : null,
    };
    let error: any = null;
    if (isNew) {
      const { data, error: e } = await sb.from('products').insert(payload).select('id').single();
      error = e;
      if (data?.id) window.history.pushState({}, '', `/admin/products/${data.id}`);
    } else {
      ({ error } = await sb.from('products').update(payload).eq('id', productId));
    }
    setSaving(false);
    if (error) alert(error.message); else alert('Saved.');
  }

  if (loading) return <AdminLayout title="Edit product" currentPath="/admin/products"><p>Loading…</p></AdminLayout>;

  return (
    <AdminLayout title={isNew ? 'New product' : form.name || 'Edit product'} subtitle={isNew ? 'Create a new catalogue entry' : 'Edit catalogue entry'} currentPath="/admin/products">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="pe-cols">

        {/* LEFT — content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h3 style={section}>Basics</h3>
            <Row label="Name"><input style={input} value={form.name} onChange={e => set('name', e.target.value)} /></Row>
            <Row label="Slug (URL)"><input style={input} value={form.slug || ''} onChange={e => set('slug', e.target.value)} placeholder="auto from name" /></Row>
            <Row label="Description"><textarea style={{ ...input, minHeight: 120, fontFamily: 'inherit' }} value={form.description || ''} onChange={e => set('description', e.target.value)} /></Row>
            <div style={twoCol}>
              <Row label="Category"><input style={input} value={form.category} onChange={e => set('category', e.target.value)} /></Row>
              <Row label="SKU"><input style={input} value={form.sku || ''} onChange={e => set('sku', e.target.value)} /></Row>
            </div>
          </div>

          <div style={card}>
            <h3 style={section}>Images</h3>
            <input
              ref={fileRef} type="file" accept="image/*" multiple
              onChange={e => handleFiles(e.target.files)}
              style={{ display: 'block', marginBottom: 12 }}
            />
            {uploading && <p style={{ fontSize: 13, color: '#888' }}>Compressing & uploading…</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {(form.images || []).map((url: string, i: number) => (
                <div key={url + i} style={{ position: 'relative', border: i === 0 ? '2px solid #0a0a0a' : '1px solid #e5e5e0', borderRadius: 4, overflow: 'hidden' }}>
                  <img src={url} alt="" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} />
                  {i === 0 && <span style={{ position: 'absolute', top: 6, left: 6, background: '#0a0a0a', color: '#fff', fontSize: 10, padding: '3px 6px', letterSpacing: '0.1em' }}>PRIMARY</span>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 6, background: '#fafafa', fontSize: 11 }}>
                    <button onClick={() => moveImage(i, -1)} style={imgBtn}>◀</button>
                    {i !== 0 && <button onClick={() => makePrimary(i)} style={imgBtn}>★</button>}
                    <button onClick={() => moveImage(i, 1)} style={imgBtn}>▶</button>
                    <button onClick={() => removeImage(i)} style={{ ...imgBtn, color: '#b91c1c' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            {!form.images?.length && <p style={{ color: '#888', fontSize: 13 }}>No images yet. Upload one or more — first image is the primary.</p>}
          </div>

          <div style={card}>
            <h3 style={section}>Variants</h3>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 14, fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.04em' }}>
              Type values separated by commas. Click outside the field to confirm each entry.
            </p>
            <Row label="Colors (comma-separated)">
              <CsvInput value={form.colors || []} onChange={v => set('colors', v)} placeholder="Black, Ivory, Burgundy" />
            </Row>
            <Row label="Sizes (comma-separated)">
              <CsvInput value={form.sizes || []} onChange={v => set('sizes', v)} placeholder="XS, S, M, L, XL" />
            </Row>
            <Row label="Lengths (comma-separated)">
              <CsvInput value={form.lengths || []} onChange={v => set('lengths', v)} placeholder="Knee, Midi, Maxi" />
            </Row>
            <Row label="Tags (comma-separated)">
              <CsvInput value={form.tags || []} onChange={v => set('tags', v)} placeholder="bridal, occasion" />
            </Row>
          </div>
        </div>

        {/* RIGHT — sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h3 style={section}>Pricing & stock</h3>
            <Row label="Price (₦)"><input style={input} type="number" value={form.price} onChange={e => set('price', e.target.value)} /></Row>
            <Row label="Sale price (₦)"><input style={input} type="number" value={form.sale_price || ''} onChange={e => set('sale_price', e.target.value || null)} /></Row>
            <Row label="Stock"><input style={input} type="number" value={form.stock} onChange={e => set('stock', e.target.value)} /></Row>
            <Row label="Weight (grams)"><input style={input} type="number" value={form.weight_grams || ''} onChange={e => set('weight_grams', e.target.value || null)} /></Row>
          </div>
          <div style={card}>
            <h3 style={section}>Visibility</h3>
            <Check checked={form.is_published} onChange={v => set('is_published', v)}>Published (visible in shop)</Check>
            <Check checked={form.on_sale}     onChange={v => set('on_sale', v)}>On sale</Check>
            <Check checked={form.is_new}      onChange={v => set('is_new', v)}>Mark as "New"</Check>
            <Check checked={form.is_featured} onChange={v => set('is_featured', v)}>Featured on home</Check>
          </div>

          <button onClick={save} disabled={saving || !form.name} style={{ ...btn, padding: '14px 20px' }}>
            {saving ? 'Saving…' : (isNew ? 'Create product' : 'Save changes')}
          </button>
          <a href="/admin/products" style={{ ...btnGhost, textDecoration: 'none', textAlign: 'center', padding: '12px 20px' }}>Cancel</a>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 900px){.pe-cols{grid-template-columns:1fr !important;}}` }} />
    </AdminLayout>
  );
}

const section: React.CSSProperties = { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, marginBottom: 14, fontWeight: 400 };
const twoCol: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const imgBtn: React.CSSProperties = { background: 'none', border: 0, cursor: 'pointer', padding: 2, fontSize: 12 };

function Row({ label: l, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 12 }}><label style={label}>{l}</label>{children}</div>;
}
function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', fontSize: 14 }}>
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      {children}
    </label>
  );
}