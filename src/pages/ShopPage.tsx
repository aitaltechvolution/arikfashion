import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { CATEGORIES, formatPrice } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';

/* ─────────────────────────────────────────
   SHOP / ALL PRODUCTS PAGE
───────────────────────────────────────── */

const SORT_OPTIONS = [
  { label: 'Latest', value: 'latest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
];

const MAX_PRICE = 100000;

export default function ShopPage() {
  const { products, loading: productsLoading } = useProducts();
  // ── Filter state ──
  const [category, setCategory] = useState('All');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('latest');
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read ?cat= URL param and apply category filter immediately
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    if (catParam) {
      // Find matching category (case-insensitive)
      const match = CATEGORIES.find(c => c.toLowerCase() === catParam.toLowerCase()) || catParam;
      setCategory(match);
    }
  }, []);

  // ── Derived products ──
  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== 'All') list = list.filter(p => p.category === category);

    const min = priceMin !== '' ? Number(priceMin) : 0;
    const max = priceMax !== '' ? Number(priceMax) : Infinity;
    list = list.filter(p => {
      const effective = p.onSale && p.salePrice ? p.salePrice : p.price;
      return effective >= min && effective <= max;
    });

    if (onSale) list = list.filter(p => p.onSale);
    if (inStock) list = list.filter(p => p.stock > 0);

    switch (sort) {
      case 'price_asc':
        list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'name_asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // latest – preserve original order
        break;
    }

    return list;
  }, [products, category, priceMin, priceMax, onSale, inStock, sort]);

  const clearAll = () => {
    setCategory('All');
    setPriceMin('');
    setPriceMax('');
    setOnSale(false);
    setInStock(false);
  };

  const hasFilters = category !== 'All' || priceMin || priceMax || onSale || inStock;

  return (
    <main style={{ minHeight: '80vh', background: '#fafafa' }}>
      {/* ── Page Header ── */}
      <PageHeader mounted={mounted} />

      <div style={layout.wrapper}>
        {/* ── Mobile filter toggle ── */}
        <div style={layout.mobileBar} className="shop-mobile-bar-show">
          <button style={layout.filterToggle} onClick={() => setFiltersOpen(v => !v)}>
            <FilterIcon />
            Filters {hasFilters && <span style={layout.filterDot} />}
          </button>
          <SortSelect value={sort} onChange={setSort} />
        </div>

        <div style={layout.body} className="shop-layout">
          {/* ── Sidebar Filters ── */}
          <aside className="shop-sidebar" style={{ ...layout.sidebar, ...(filtersOpen ? layout.sidebarOpen : {}) }}>
            <div style={layout.sidebarInner}>
              <div style={layout.sidebarHead}>
                <h2 style={layout.sidebarTitle}>Filters</h2>
                {hasFilters && (
                  <button style={layout.clearBtn} onClick={clearAll}>Clear all</button>
                )}
              </div>

              {/* Category */}
              <FilterSection title="Category">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        ...filter.catBtn,
                        ...(category === cat ? filter.catBtnActive : {}),
                      }}
                    >
                      {cat}
                      <span style={filter.catCount}>
                        {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                      </span>
                    </button>
                  ))}
                </div>
              </FilterSection>

              <div style={layout.divider} />

              {/* Price Range */}
              <FilterSection title="Price Range">
                <div style={filter.priceRow}>
                  <div style={filter.priceField}>
                    <label style={filter.priceLabel}>Min (₦)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={priceMin}
                      onChange={e => setPriceMin(e.target.value)}
                      style={filter.priceInput}
                      min={0}
                    />
                  </div>
                  <span style={filter.priceDash}>—</span>
                  <div style={filter.priceField}>
                    <label style={filter.priceLabel}>Max (₦)</label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={priceMax}
                      onChange={e => setPriceMax(e.target.value)}
                      style={filter.priceInput}
                      min={0}
                    />
                  </div>
                </div>
                <div style={filter.quickPrices}>
                  {[
                    { label: 'Under ₦30k', min: '', max: '30000' },
                    { label: '₦30k–₦60k', min: '30000', max: '60000' },
                    { label: '₦60k+', min: '60000', max: '' },
                  ].map(q => (
                    <button
                      key={q.label}
                      style={{
                        ...filter.quickPrice,
                        ...(priceMin === q.min && priceMax === q.max ? filter.quickPriceActive : {}),
                      }}
                      onClick={() => { setPriceMin(q.min); setPriceMax(q.max); }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <div style={layout.divider} />

              {/* Product Status */}
              <FilterSection title="Product Status">
                <label style={filter.checkLabel}>
                  <input
                    type="checkbox"
                    checked={onSale}
                    onChange={e => setOnSale(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ ...filter.checkbox, ...(onSale ? filter.checkboxChecked : {}) }}>
                    {onSale && <CheckIcon />}
                  </span>
                  On Sale
                  <span style={filter.saleBadge}>SALE</span>
                </label>
                <label style={filter.checkLabel}>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={e => setInStock(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ ...filter.checkbox, ...(inStock ? filter.checkboxChecked : {}) }}>
                    {inStock && <CheckIcon />}
                  </span>
                  In Stock
                </label>
              </FilterSection>
            </div>
          </aside>

          {/* ── Products Area ── */}
          <div style={layout.productsArea}>
            {/* Top bar (desktop sort + count) */}
            <div style={layout.topBar}>
              <p style={layout.count}>
                <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}
                {hasFilters && ' found'}
              </p>
              <div style={layout.desktopSort} className="shop-desktop-sort">
                <SortSelect value={sort} onChange={setSort} />
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div style={layout.chips}>
                {category !== 'All' && (
                  <Chip label={category} onRemove={() => setCategory('All')} />
                )}
                {(priceMin || priceMax) && (
                  <Chip
                    label={`₦${priceMin || '0'} – ₦${priceMax || '∞'}`}
                    onRemove={() => { setPriceMin(''); setPriceMax(''); }}
                  />
                )}
                {onSale && <Chip label="On Sale" onRemove={() => setOnSale(false)} />}
                {inStock && <Chip label="In Stock" onRemove={() => setInStock(false)} />}
              </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <div style={layout.grid}>
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter backdrop ── */}
      {filtersOpen && (
        <div
          style={layout.backdrop}
          onClick={() => setFiltersOpen(false)}
        />
      )}
    </main>
  );
}

/* ── Page Header ── */
function PageHeader({ mounted }: { mounted: boolean }) {
  return (
    <div style={header.section}>
      <div style={header.bg} />
      <div style={header.overlay} />
      <div style={{
        ...header.content,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(16px)',
        transition: 'all 0.7s ease 0.1s',
      }}>
        <p style={header.eyebrow}>Aital Fashion · 2026</p>
        <h1 style={header.heading}>All Products</h1>
        <p style={header.sub}>Made for a woman who knows her worth and dresses like it.</p>
      </div>
    </div>
  );
}

/* ── Filter Section ── */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 4 }}>
      <button style={filter.sectionHead} onClick={() => setOpen(v => !v)}>
        <span style={filter.sectionTitle}>{title}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          stroke="currentColor" strokeWidth="1.8"
          style={{ transition: 'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && <div style={{ paddingBottom: 8 }}>{children}</div>}
    </div>
  );
}

/* ── Sort Select ── */
function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={filter.sortSelect}
    >
      {SORT_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* ── Chip ── */
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={layout.chip}>
      {label}
      <button onClick={onRemove} style={layout.chipX} aria-label={`Remove ${label}`}>×</button>
    </div>
  );
}

/* ── Product Card ── */
function ProductCard({ product: p, index }: { product: Product; index: number }) {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(p, p.colors[0], p.sizes[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  useEffect(() => {
    if (hovered && p.images.length > 1) {
      const t = setTimeout(() => setImgIndex(1), 180);
      return () => clearTimeout(t);
    } else {
      setImgIndex(0);
    }
  }, [hovered, p.images.length]);

  const effectivePrice = p.onSale && p.salePrice ? p.salePrice : p.price;
  const outOfStock = p.stock === 0;

  return (
    <div
      style={{
        ...card.wrap,
        animationDelay: `${index * 60}ms`,
        animationFillMode: 'both',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <a href={`/product/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={card.imgWrap}>
        <img
          src={p.images[imgIndex]}
          alt={p.name}
          style={{
            ...card.img,
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}
        />

        {/* Badges */}
        <div style={card.badges}>
          {p.isNew && <span style={card.badgeNew}>New</span>}
          {p.onSale && <span style={card.badgeSale}>Sale</span>}
          {outOfStock && <span style={card.badgeOut}>Sold Out</span>}
        </div>

        {/* Quick Add */}
        {!outOfStock && (
          <button
            style={{
              ...card.quickAdd,
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
            }}
            onClick={handleAdd}
          >
            {added ? '✓ Added' : 'Quick Add'}
          </button>
        )}
      </div>
      </a>

      {/* Info */}
      <div style={card.info}>
        <a href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <p style={card.category}>{p.category}</p>
        <h3 style={card.name}>{p.name}</h3>
        </a>
        <div style={card.priceRow}>
          <span style={p.onSale ? card.priceSale : card.price}>
            {formatPrice(effectivePrice)}
          </span>
          {p.onSale && p.salePrice && (
            <span style={card.priceOrig}>{formatPrice(p.price)}</span>
          )}
        </div>
        {/* Color swatches */}
        <div style={card.colors}>
          {p.colors.slice(0, 4).map(c => (
            <span key={c} style={card.colorLabel}>{c}</span>
          ))}
          {p.colors.length > 4 && (
            <span style={card.colorMore}>+{p.colors.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div style={empty.wrap}>
      <div style={empty.icon}>⌕</div>
      <h3 style={empty.title}>No products found</h3>
      <p style={empty.sub}>Try adjusting or clearing your filters</p>
      <button style={empty.btn} onClick={onClear}>Clear Filters</button>
    </div>
  );
}

/* ── Icons ── */
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="20" y2="12" />
    <line x1="12" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6" r="2" fill="currentColor" />
    <circle cx="4" cy="12" r="2" fill="currentColor" />
  </svg>
);
const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <path d="M1.5 5l2.5 2.5 4.5-4" />
  </svg>
);

/* ── Styles ── */

const header: Record<string, React.CSSProperties> = {
  section: {
    position: 'relative',
    height: 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: '#0a0a0a',
  },
  bg: {
    backgroundAttachment: "fixed",
    position: 'absolute', inset: 0,
    backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=75')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.38
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.75) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center' as const,
    color: '#fafafa',
    padding: '0 24px',
  },
  eyebrow: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 10,
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  heading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(40px, 7vw, 72px)',
    fontWeight: 300,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    lineHeight: 1,
    marginBottom: 14,
  },
  sub: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 12,
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.6)',
    maxWidth: 420,
    margin: '0 auto',
  },
};

const layout: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: 1440,
    margin: '0 auto',
    padding: '0 clamp(16px, 4vw, 48px)',
  },
  mobileBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid #f0f0f0',
    gap: 12,
  },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: '1px solid #ddd',
    padding: '8px 14px',
    fontSize: 11,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    color: '#0a0a0a',
    position: 'relative' as const,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#c0392b',
    display: 'inline-block',
    marginLeft: 2,
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: 40,
    paddingTop: 28,
    paddingBottom: 64,
    alignItems: 'start',
  },
  sidebar: {
    position: 'sticky' as const,
    top: 90,
    background: '#fff',
    border: '1px solid #f0f0f0',
  },
  sidebarOpen: {},
  sidebarInner: {
    padding: '20px 20px',
  },
  sidebarHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sidebarTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    fontWeight: 400,
    letterSpacing: '0.06em',
    color: '#0a0a0a',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 10,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#444',
    textDecoration: 'underline',
    padding: 0,
  },
  divider: {
    height: 1,
    background: '#f0f0f0',
    margin: '12px 0',
  },
  productsArea: {
    minWidth: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  count: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 11,
    letterSpacing: '0.08em',
    color: '#444',
  },
  desktopSort: {},
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 24,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#0a0a0a',
    color: '#fafafa',
    padding: '5px 10px 5px 12px',
    fontSize: 10,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
  chipX: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#fafafa',
    fontSize: 16,
    lineHeight: 1,
    padding: '0 2px',
    opacity: 0.7,
  },
  backdrop: {
    display: 'none',
  },
};

const filter: Record<string, React.CSSProperties> = {
  catBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '7px 8px',
    fontSize: 11,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    color: '#555',
    textAlign: 'left' as const,
    transition: 'all 0.15s',
  },
  catBtnActive: {
    color: '#0a0a0a',
    fontWeight: 600,
    background: '#f5f5f5',
  },
  catCount: {
    fontSize: 9,
    color: '#bbb',
    fontWeight: 400,
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '10px 0',
    cursor: 'pointer',
    color: '#0a0a0a',
  },
  sectionTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 10,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    fontWeight: 600,
    color: '#0a0a0a',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 10,
  },
  priceField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  priceLabel: {
    fontSize: 9,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.1em',
    color: '#555',
    textTransform: 'uppercase' as const,
  },
  priceInput: {
    width: '100%',
    border: '1px solid #ddd',
    padding: '7px 8px',
    fontSize: 12,
    fontFamily: "'Montserrat', sans-serif",
    color: '#0a0a0a',
    background: '#fafafa',
    outline: 'none',
    appearance: 'textfield' as const,
  },
  priceDash: {
    fontSize: 14,
    color: '#bbb',
    paddingBottom: 8,
  },
  quickPrices: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  quickPrice: {
    fontSize: 9,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    border: '1px solid #ddd',
    background: 'none',
    padding: '4px 8px',
    cursor: 'pointer',
    color: '#666',
    transition: 'all 0.15s',
  },
  quickPriceActive: {
    background: '#0a0a0a',
    color: '#fafafa',
    border: '1px solid #0a0a0a',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    padding: '7px 0',
    fontSize: 11,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.08em',
    color: '#444',
    userSelect: 'none' as const,
  },
  checkbox: {
    width: 16,
    height: 16,
    border: '1.5px solid #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  checkboxChecked: {
    background: '#0a0a0a',
    border: '1.5px solid #0a0a0a',
  },
  saleBadge: {
    fontSize: 8,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.12em',
    background: '#c0392b',
    color: '#fff',
    padding: '2px 5px',
    marginLeft: 2,
  },
  sortSelect: {
    border: '1px solid #ddd',
    background: '#fafafa',
    padding: '8px 28px 8px 10px',
    fontSize: 11,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.08em',
    color: '#0a0a0a',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'auto' as const,
  },
};

const card: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#fff',
    cursor: 'pointer',
    animation: 'fadeUp 0.45s ease both',
  },
  imgWrap: {
    position: 'relative' as const,
    overflow: 'hidden',
    paddingBottom: '130%',
    background: '#f5f5f5',
  },
  img: {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
  },
  badges: {
    position: 'absolute' as const,
    top: 10,
    left: 10,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  badgeNew: {
    fontSize: 8,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    background: '#0a0a0a',
    color: '#fafafa',
    padding: '3px 7px',
  },
  badgeSale: {
    fontSize: 8,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    background: '#c0392b',
    color: '#fff',
    padding: '3px 7px',
  },
  badgeOut: {
    fontSize: 8,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    background: 'rgba(255,255,255,0.85)',
    color: '#444',
    padding: '3px 7px',
  },
  quickAdd: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: '#0a0a0a',
    color: '#fafafa',
    border: 'none',
    padding: '12px 0',
    fontSize: 10,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'opacity 0.22s, transform 0.22s',
  },
  info: {
    padding: '12px 14px 14px',
  },
  category: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 9,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: '#555',
    marginBottom: 4,
  },
  name: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 17,
    fontWeight: 400,
    letterSpacing: '0.03em',
    color: '#0a0a0a',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    color: '#0a0a0a',
  },
  priceSale: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: '#c0392b',
  },
  priceOrig: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 11,
    color: '#bbb',
    textDecoration: 'line-through',
  },
  colors: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 4,
  },
  colorLabel: {
    fontSize: 8,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.08em',
    color: '#999',
    border: '1px solid #eee',
    padding: '2px 5px',
  },
  colorMore: {
    fontSize: 8,
    fontFamily: "'Montserrat', sans-serif",
    color: '#bbb',
    padding: '2px 0',
  },
};

const empty: Record<string, React.CSSProperties> = {
  wrap: {
    textAlign: 'center' as const,
    padding: '80px 24px',
  },
  icon: {
    fontSize: 48,
    color: '#ddd',
    marginBottom: 16,
    fontFamily: 'serif',
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 28,
    fontWeight: 400,
    color: '#0a0a0a',
    marginBottom: 8,
  },
  sub: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 11,
    color: '#555',
    letterSpacing: '0.08em',
    marginBottom: 28,
  },
  btn: {
    background: '#0a0a0a',
    color: '#fafafa',
    border: 'none',
    padding: '12px 32px',
    fontSize: 10,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
  },
};
