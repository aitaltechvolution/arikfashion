import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { formatPrice } from '../data/products';

const CHIPS = ['Dresses', 'New Arrivals', 'Sets', 'Tops', 'Bottoms'];

interface Props { products: Product[]; }

export default function SearchOverlay({ products }: Props) {
  const { isSearchOpen, setIsSearchOpen } = useCart();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setIsSearchOpen]);

  const results = query.length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  if (!isSearchOpen) return null;

  return (
    <>
      <style>{`
        @keyframes searchOverlayIn {
          from { opacity: 0; backdrop-filter: blur(0); }
          to   { opacity: 1; }
        }
        @keyframes searchContentIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .search-close-btn:hover { opacity: 1 !important; }
        .search-chip:hover { border-color: #c9a96e !important; color: #fafafa !important; background: rgba(201,169,110,0.1) !important; }
      `}</style>
    <div style={styles.overlay}>
      <button style={styles.closeBtn} onClick={() => setIsSearchOpen(false)}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
        Close
      </button>

      <p style={styles.label}>Search Arik Fashion</p>

      <div style={styles.inputWrap}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search products…"
          style={styles.input}
          spellCheck={false}
          autoComplete="off"
        />
        <svg style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
          width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      {results.length > 0 ? (
        <div style={styles.results}>
          {results.map(p => (
            <a key={p.id} href={`/product/${p.id}`} style={styles.resultItem} onClick={() => setIsSearchOpen(false)}>
              <img src={p.images[0]} alt={p.name} style={styles.resultImg} />
              <div>
                <div style={styles.resultName}>{p.name}</div>
                <div style={styles.resultCat}>{p.category}</div>
                <div style={styles.resultPrice}>{formatPrice(p.price)}</div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <>
          <p style={styles.hint}>{query.length > 1 ? 'No results found' : 'Start typing to search'}</p>
          <div style={styles.chips}>
            {CHIPS.map(c => (
              <button key={c} style={styles.chip} onClick={() => setQuery(c)}>{c}</button>
            ))}
          </div>
        </>
      )}
    </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.97)',
    zIndex: 2000, display: 'flex', flexDirection: 'column',
    alignItems: 'center', paddingTop: 110, padding: '110px 24px 40px',
    animation: 'searchOverlayIn 0.35s cubic-bezier(0.22,1,0.36,1)',
  },
  closeBtn: {
    position: 'absolute', top: 24, right: 32, background: 'none', border: 'none',
    color: '#fafafa', cursor: 'pointer', fontSize: 11, letterSpacing: '0.18em',
    textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif",
    display: 'flex', alignItems: 'center', gap: 8, opacity: 0.6,
  },
  label: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: 13,
    letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: 24,
  },
  inputWrap: { position: 'relative', width: '100%', maxWidth: 580 },
  input: {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: '1px solid #555', color: '#fafafa',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300,
    letterSpacing: '0.04em', padding: '8px 48px 8px 0', outline: 'none',
    caretColor: 'white',
  },
  hint: { marginTop: 20, fontSize: 11, letterSpacing: '0.14em', color: '#555', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif" },
  chips: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 28, maxWidth: 580 },
  chip: {
    border: '1px solid #333', color: '#888', padding: '6px 16px',
    fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
    cursor: 'pointer', background: 'transparent', fontFamily: "'Montserrat', sans-serif",
    transition: 'all 0.2s',
  },
  results: {
    marginTop: 28, width: '100%', maxWidth: 580,
    display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '55vh',
  },
  resultItem: {
    display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0',
    borderBottom: '1px solid #1a1a1a', textDecoration: 'none', color: '#fafafa',
  },
  resultImg: { width: 52, height: 64, objectFit: 'cover', background: '#1a1a1a', flexShrink: 0 },
  resultName: { fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 500, marginBottom: 2 },
  resultCat: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.1em', color: '#666', textTransform: 'uppercase' },
  resultPrice: { fontFamily: "'Cormorant Garamond', serif", fontSize: 16, marginTop: 4, color: '#bbb' },
};
