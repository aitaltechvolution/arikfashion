import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { CATEGORIES, formatPrice } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';

/* ─────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────── */
export default function HomePage() {
  const { products } = useProducts();
  const featured = products.filter(p => p.isFeatured);
  const newArrivals = products.filter(p => p.isNew);

  return (
    <main>
      <Hero />
      <MarqueeStrip />
      <FeaturedGrid products={featured} />
      <EditorialBanner />
      <NewArrivals products={newArrivals} />
      <CategoryStrip />
      <InstagramStrip />
    </main>
  );
}

/* ─── HERO ─── */
function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  return (
    <section style={heroStyles.section}>
      {/* Full bleed image placeholder — swap src for actual hero image */}
      <div style={heroStyles.imgBg} />
      <div style={heroStyles.overlay} />

      <div style={{ ...heroStyles.content, opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(20px)', transition: 'all 0.9s ease 0.1s' }}>
        <p style={heroStyles.eyebrow}>New Season · 2026</p>
        <h1 style={heroStyles.heading}>
          Dressed<br />
          <em style={heroStyles.italic}>For You</em>
        </h1>
        <p style={heroStyles.sub}>
          Handcrafted luxury fashion from Lagos.<br />
          Bold. Intentional. Entirely yours.
        </p>
        <div style={heroStyles.btnRow}>
          <a href="/shop" style={heroStyles.btnPrimary}>Shop Now</a>
          <a href="/shop?cat=New+Arrivals" style={heroStyles.btnGhost}>New Arrivals</a>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={heroStyles.scrollHint}>
        <div style={heroStyles.scrollLine} />
        <span style={heroStyles.scrollLabel}>Scroll</span>
      </div>
    </section>
  );
}

const heroStyles: Record<string, React.CSSProperties> = {
  section: {
    position: 'relative',
    height: '100vh',
    minHeight: 600,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    background: '#0a0a0a',
  },
  imgBg: {
    position: 'absolute', inset: 0,
    backgroundImage: `url('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=85')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center 20%',
    opacity: 0.55,
    backgroundAttachment: 'fixed',
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(105deg, rgba(10,10,10,0.82) 40%, rgba(10,10,10,0.2) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    padding: '0 clamp(24px, 6vw, 120px)',
    maxWidth: 680,
  },
  eyebrow: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 11,
    letterSpacing: '0.28em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 20,
  },
  heading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(72px, 10vw, 120px)',
    fontWeight: 300,
    lineHeight: 0.92,
    color: '#fafafa',
    marginBottom: 28,
    letterSpacing: '-0.01em',
  },
  italic: {
    fontStyle: 'italic',
    fontWeight: 300,
  },
  sub: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 13,
    fontWeight: 400,
    letterSpacing: '0.04em',
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 36,
  },
  btnRow: { display: 'flex', gap: 16, flexWrap: 'wrap' as const },
  btnPrimary: {
    display: 'inline-block',
    background: '#fafafa',
    color: '#0a0a0a',
    padding: '14px 36px',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background 0.2s',
  },
  btnGhost: {
    display: 'inline-block',
    background: 'transparent',
    color: '#fafafa',
    padding: '14px 36px',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.35)',
  },
  scrollHint: {
    position: 'absolute', bottom: 36, left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', gap: 8, zIndex: 2,
  },
  scrollLine: {
    width: 1, height: 48, background: 'rgba(255,255,255,0.25)',
    animation: 'scrollPulse 2s ease-in-out infinite',
  },
  scrollLabel: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 9, letterSpacing: '0.22em',
    textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)',
  },
};

/* ─── MARQUEE STRIP ─── */
const STRIP_ITEMS = ['New Season', '·', 'Free Shipping ₦50k+', '·', 'Lagos Made', '·', 'Premium Quality', '·', 'Handcrafted', '·'];

function MarqueeStrip() {
  return (
    <div style={marqueeStyles.strip}>
      <div style={marqueeStyles.track}>
        {[...STRIP_ITEMS, ...STRIP_ITEMS].map((t, i) => (
          <span key={i} style={{ opacity: t === '·' ? 0.3 : 1 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
const marqueeStyles: Record<string, React.CSSProperties> = {
  strip: {
    background: '#0a0a0a', color: '#fafafa', height: 44,
    display: 'flex', alignItems: 'center', overflow: 'hidden',
  },
  track: {
    display: 'flex', gap: 40, animation: 'ticker 28s linear infinite',
    whiteSpace: 'nowrap', fontSize: 11, letterSpacing: '0.18em',
    textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
  },
};

/* ─── FEATURED GRID ─── */
function FeaturedGrid({ products }: { products: Product[] }) {
  return (
    <section style={featStyles.section}>
      <SectionHeader title="Featured" sub="Curated for you" />
      <div style={featStyles.grid}>
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} large={i === 0} />
        ))}
      </div>
    </section>
  );
}
const featStyles: Record<string, React.CSSProperties> = {
  section: { padding: 'clamp(48px, 7vw, 96px) clamp(16px, 4vw, 64px)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 24,
  },
};

/* ─── PRODUCT CARD ─── */
function ProductCard({ product, large }: { product: Product; large?: boolean }) {
  const { addToCart, toggleWishlist, isWishlisted, setIsCartOpen } = useCart();
  const [hov, setHov] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, product.colors[0], product.sizes[Math.floor(product.sizes.length / 2)]);
    setIsCartOpen(true);
  };

  return (
    <div
      style={{ ...cardStyles.card, ...(large ? cardStyles.cardLarge : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <a href={`/product/${product.id}`} style={cardStyles.imgWrap}>
        <img
          src={product.images[0]}
          alt={product.name}
          style={{ ...cardStyles.img, transform: hov ? 'scale(1.04)' : 'scale(1)' }}
        />
        {/* Hover second image */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt=""
            style={{ ...cardStyles.img, ...cardStyles.imgAlt, opacity: hov ? 1 : 0 }}
          />
        )}

        {/* Badges */}
        <div style={cardStyles.badges}>
          {product.isNew && <span style={cardStyles.badge}>New</span>}
          {product.stock <= 4 && <span style={{ ...cardStyles.badge, background: '#0a0a0a' }}>Low Stock</span>}
        </div>

        {/* Wishlist */}
        <button
          style={{ ...cardStyles.wishBtn, ...(wishlisted ? cardStyles.wishActive : {}) }}
          onClick={e => { e.preventDefault(); toggleWishlist(product); }}
          aria-label="Toggle wishlist"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Quick add */}
        <button
          style={{ ...cardStyles.quickAdd, opacity: hov ? 1 : 0 }}
          onClick={handleQuickAdd}
        >
          Quick Add
        </button>
      </a>

      <div style={cardStyles.info}>
        <div style={cardStyles.infoTop}>
          <span style={cardStyles.name}>{product.name}</span>
          <span style={cardStyles.price}>{formatPrice(product.price)}</span>
        </div>
        <div style={cardStyles.cat}>{product.category}</div>
        {/* Color swatches */}
        <div style={cardStyles.swatches}>
          {product.colors.map(c => (
            <span key={c} style={{
              ...cardStyles.swatch,
              background: c === 'Black' ? '#0a0a0a' : c === 'White' ? '#fafafa' :
                c === 'Ivory' || c === 'Cream' ? '#f5f0e8' : c === 'Blush' ? '#f0d0c4' :
                c === 'Camel' ? '#c8a06a' : '#c8c8c8',
              border: c === 'White' || c === 'Ivory' || c === 'Cream' ? '1px solid #c8c8c8' : '1px solid transparent',
            }} title={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

const cardStyles: Record<string, React.CSSProperties> = {
  card: { position: 'relative', display: 'flex', flexDirection: 'column' },
  cardLarge: { gridColumn: 'span 2' },
  imgWrap: {
    position: 'relative', display: 'block', overflow: 'hidden',
    paddingBottom: '125%', background: '#f5f5f5', textDecoration: 'none',
  },
  img: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease',
  },
  imgAlt: {
    transition: 'opacity 0.35s ease',
    zIndex: 1,
  },
  badges: { position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 },
  badge: {
    background: '#fafafa', color: '#0a0a0a',
    fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
    padding: '3px 8px', fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
  },
  wishBtn: {
    position: 'absolute', top: 12, right: 12, zIndex: 2,
    background: 'rgba(250,250,250,0.88)', border: 'none', cursor: 'pointer',
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#0a0a0a',
  },
  wishActive: { color: '#c0392b' },
  quickAdd: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
    background: 'rgba(10,10,10,0.9)', color: '#fafafa',
    border: 'none', cursor: 'pointer', padding: '13px 0',
    fontFamily: "'Montserrat', sans-serif", fontSize: 10,
    letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
    transition: 'opacity 0.25s ease',
  },
  info: { padding: '14px 0 8px' },
  infoTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  name: { fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: '0.02em', color: '#0a0a0a' },
  price: { fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 500, color: '#0a0a0a' },
  cat: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 },
  swatches: { display: 'flex', gap: 5 },
  swatch: { width: 13, height: 13, borderRadius: '50%', display: 'inline-block' },
};

/* ─── EDITORIAL BANNER ─── */
function EditorialBanner() {
  return (
    <section style={bannerStyles.section}>
      <div style={bannerStyles.imgSide}>
        <img
          src="https://images.unsplash.com/photo-1495385794356-15371f348c31?w=900&q=80"
          alt="Editorial"
          style={bannerStyles.img}
        />
      </div>
      <div style={bannerStyles.textSide}>
        <p style={bannerStyles.eyebrow}>The Aital Story</p>
        <h2 style={bannerStyles.heading}>Fashion that<br /><em>speaks first</em></h2>
        <p style={bannerStyles.body}>
          Every piece in our collection is designed with intention — where African craftsmanship meets contemporary luxury. We create clothes that command attention before you say a word.
        </p>
        <a href="/about" style={bannerStyles.link}>Our Story →</a>
      </div>
    </section>
  );
}
const bannerStyles: Record<string, React.CSSProperties> = {
  section: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    background: '#0a0a0a', minHeight: 540,
  },
  imgSide: { overflow: 'hidden', position: 'relative' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.75 },
  textSide: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    padding: 'clamp(40px, 7vw, 96px)',
  },
  eyebrow: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.28em',
    textTransform: 'uppercase', color: '#555', marginBottom: 20,
  },
  heading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(40px, 5vw, 64px)',
    fontWeight: 300, lineHeight: 1.1, color: '#fafafa', marginBottom: 24,
  },
  body: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 300,
    letterSpacing: '0.02em', lineHeight: 1.85, color: '#888', marginBottom: 36,
  },
  link: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.18em',
    textTransform: 'uppercase', color: '#fafafa', textDecoration: 'none',
    borderBottom: '1px solid #333', paddingBottom: 3, alignSelf: 'flex-start',
  },
};

/* ─── NEW ARRIVALS ─── */
function NewArrivals({ products }: { products: Product[] }) {
  return (
    <section style={naStyles.section}>
      <SectionHeader title="New Arrivals" sub="Just landed" />
      <div style={naStyles.grid}>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <a href="/shop" style={naStyles.viewAll}>View All Products</a>
      </div>
    </section>
  );
}
const naStyles: Record<string, React.CSSProperties> = {
  section: { padding: 'clamp(48px, 7vw, 96px) clamp(16px, 4vw, 64px)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
  },
  viewAll: {
    display: 'inline-block',
    border: '1px solid #0a0a0a',
    color: '#0a0a0a',
    padding: '14px 48px',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
    textDecoration: 'none', transition: 'all 0.2s',
  },
};

/* ─── CATEGORY STRIP ─── */
const CAT_IMGS: Record<string, string> = {
  Dresses: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80',
  Sets:    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80',
  Tops:    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80',
  Bottoms: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80',
};

function CategoryStrip() {
  return (
    <section style={catStyles.section}>
      <SectionHeader title="Shop by Category" sub="" />
      <div style={catStyles.grid}>
        {Object.entries(CAT_IMGS).map(([cat, img]) => (
          <a key={cat} href={`/shop?cat=${cat}`} style={catStyles.card}>
            <img src={img} alt={cat} style={catStyles.img} />
            <div style={catStyles.overlay} />
            <span style={catStyles.label}>{cat}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
const catStyles: Record<string, React.CSSProperties> = {
  section: { padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 64px)', background: '#f8f8f8' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  card: {
    position: 'relative', display: 'block', overflow: 'hidden',
    paddingBottom: '140%', textDecoration: 'none', background: '#e8e8e8',
  },
  img: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' },
  overlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 55%)' },
  label: {
    position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400,
    letterSpacing: '0.1em', color: '#fafafa',
  },
};

/* ─── INSTAGRAM STRIP (placeholder) ─── */
const IG_IMGS = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
];

function InstagramStrip() {
  return (
    <section style={igStyles.section}>
      <SectionHeader title="@Aital.fashion" sub="Follow us on Instagram" />
      <div style={igStyles.grid}>
        {IG_IMGS.map((src, i) => (
          <a key={i} href="https://instagram.com" target="_blank" rel="noreferrer" style={igStyles.item}>
            <img src={src} alt="" style={igStyles.img} />
            <div style={igStyles.hover}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5"/>
                <circle cx="17.5" cy="6.5" r="1" fill="white"/>
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
const igStyles: Record<string, React.CSSProperties> = {
  section: { padding: 'clamp(40px, 6vw, 80px) 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' },
  item: {
    position: 'relative', display: 'block', overflow: 'hidden',
    paddingBottom: '100%', background: '#f0f0f0',
  },
  img: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', transition: 'transform 0.5s ease, opacity 0.3s',
  },
  hover: {
    position: 'absolute', inset: 0,
    background: 'rgba(10,10,10,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0, transition: 'opacity 0.3s',
  },
};

/* ─── SECTION HEADER ─── */
function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={shStyles.wrap}>
      <h2 style={shStyles.title}>{title}</h2>
      {sub && <p style={shStyles.sub}>{sub}</p>}
    </div>
  );
}
const shStyles: Record<string, React.CSSProperties> = {
  wrap: { textAlign: 'center', marginBottom: 40 },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(32px, 4vw, 48px)',
    fontWeight: 300, letterSpacing: '0.08em', color: '#0a0a0a', marginBottom: 8,
  },
  sub: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888',
  },
};
