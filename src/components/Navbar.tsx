import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import CartDrawer from './CartDrawer';
import SearchOverlay from './SearchOverlay';
import AccountDropdown from './AccountDropdown';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    href: '/shop',
    children: ['New Arrivals', 'Dresses', 'Sets', 'Tops', 'Bottoms'],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { cartCount, wishlist, setIsCartOpen, setIsSearchOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(label);
  };
  const handleMouseLeave = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  return (
    <>
      <style>{`
        .hamburger-btn { display: none; }
        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
          .hamburger-btn { display: flex !important; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
          .nav-icon-wish, .nav-icon-account, .nav-divider { display: none !important; }
          .nav-inner-grid { display: flex !important; justify-content: space-between !important; align-items: center !important; }
          .nav-logo-center { text-align: left !important; }
          .nav-logo-center span:last-child { display: none !important; }
        }
        @media (max-width: 640px) {
          .nav-logo-word { font-size: 20px !important; letter-spacing: 0.14em !important; }
          .nav-logo-sub { display: none !important; }
          .nav-inner-grid { padding: 0 14px !important; }
        }
        .nav-dropdown-link-item:hover { background: #f5f5f5 !important; }
        .mobile-sub-link:hover { color: #c9a84c !important; }
        .mobile-main-link:hover { opacity: 0.65; }
      `}</style>

      {/* Announcement ticker */}
      <div style={styles.topBar}>
        <div style={styles.ticker}>
          {[
            'Free shipping on orders over ₦50,000', '·',
            'New Arrivals – Aital Fashion 2026', '·',
            'Exclusively crafted in Lagos', '·',
            'Free shipping on orders over ₦50,000', '·',
            'New Arrivals – Aital Fashion 2026', '·',
            'Exclusively crafted in Lagos',
          ].map((t, i) => (
            <span key={i} style={{ opacity: t === '·' ? 0.35 : 0.85 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div className="nav-inner-grid" style={styles.navInner}>

          {/* LEFT — nav links (desktop) */}
          <ul className="nav-links-desktop" style={styles.navLinks}>
            {NAV_LINKS.map(link => (
              <li
                key={link.label}
                style={styles.navItem}
                onMouseEnter={() => link.children && handleMouseEnter(link.label)}
                onMouseLeave={handleMouseLeave}
              >
                <a href={link.href} style={styles.navLink}>
                  {link.label}
                  {link.children && (
                    <svg
                      style={{ ...styles.chevron, ...(activeDropdown === link.label ? styles.chevronOpen : {}) }}
                      viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
                    >
                      <path d="M2 4l4 4 4-4" />
                    </svg>
                  )}
                </a>
                {link.children && activeDropdown === link.label && (
                  <div style={styles.dropdown}>
                    {link.children.map(child => (
                      <a key={child} href={`/shop?cat=${child}`} className="nav-dropdown-link-item" style={styles.dropdownLink}>
                        {child}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* CENTER – Logo */}
          <a href="/" className="nav-logo-center" style={styles.logo}>
            <span className="nav-logo-word" style={styles.logoWord}>Aital Fashion</span>
            <span className="nav-logo-sub" style={styles.logoSub}>Lagos · Nigeria</span>
          </a>

          {/* RIGHT – Icons */}
          <div className="nav-actions-right" style={styles.actions}>
            <IconBtn label="Search" onClick={() => setIsSearchOpen(true)}>
              <SearchIcon />
            </IconBtn>

            <IconBtn label="Wishlist" extraClass="nav-icon-wish" onClick={() => {}}>
              <HeartIcon />
              {wishlist.length > 0 && <span style={styles.wishDot} />}
            </IconBtn>

            <span className="nav-icon-account"><AccountDropdown /></span>

            <div className="nav-divider" style={styles.divider} />

            <IconBtn label="Cart" onClick={() => setIsCartOpen(true)}>
              <BagIcon />
              {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
            </IconBtn>

            {/* Hamburger — always rendered, shown via CSS */}
            <button
              className="hamburger-btn"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span style={{ ...styles.bar, ...(mobileOpen ? styles.bar1Open : {}) }} />
              <span style={{ ...styles.bar, ...(mobileOpen ? styles.bar2Open : {}) }} />
              <span style={{ ...styles.bar, ...(mobileOpen ? styles.bar3Open : {}) }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={styles.mobileBackdrop}
        />
      )}

      {/* Mobile menu */}
      <div style={{ ...styles.mobileMenu, ...(mobileOpen ? styles.mobileMenuOpen : {}) }}>
        {/* Mobile icons row */}
        <div style={styles.mobileTopRow}>
          <button style={styles.mobileIconBtn} onClick={() => { setIsSearchOpen(true); setMobileOpen(false); }} aria-label="Search">
            <SearchIcon /> <span style={styles.mobileIconLabel}>Search</span>
          </button>
          <button style={styles.mobileIconBtn} onClick={() => {}} aria-label="Wishlist">
            <HeartIcon /> <span style={styles.mobileIconLabel}>Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</span>
          </button>
          <button style={styles.mobileIconBtn} onClick={() => setIsCartOpen(true)} aria-label="Cart">
            <BagIcon /> <span style={styles.mobileIconLabel}>Cart {cartCount > 0 && `(${cartCount})`}</span>
          </button>
        </div>

        <div style={styles.mobileDivider} />

        {/* Nav links */}
        {NAV_LINKS.map(link => (
          <div key={link.label}>
            <a href={link.href} className="mobile-main-link" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
            {link.children && (
              <div style={styles.mobileSub}>
                {link.children.map(c => (
                  <a key={c} href={`/shop?cat=${c}`} className="mobile-sub-link" style={styles.mobileSubLink} onClick={() => setMobileOpen(false)}>
                    {c}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={styles.mobileDivider} />
        <div style={styles.mobileFooter}>
          <a href="/account" style={styles.mobileFooterLink} onClick={() => setMobileOpen(false)}>My Account</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.mobileFooterLink}>Instagram</a>
          <a href="https://wa.me/2347063730930" target="_blank" rel="noreferrer" style={styles.mobileFooterLink}>WhatsApp</a>
        </div>
      </div>

      <CartDrawer />
      <SearchOverlay products={PRODUCTS} />
    </>
  );
}

function IconBtn({ label, onClick, children, extraClass }: {
  label: string; onClick: () => void; children: React.ReactNode; extraClass?: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={extraClass}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...styles.iconBtn, ...(hov ? styles.iconBtnHov : {}) }}
    >
      {children}
    </button>
  );
}

/* ── Icons ── */
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const BagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

/* ── Styles ── */
const styles: Record<string, React.CSSProperties> = {
  topBar: { background: '#0a0a0a', color: '#fafafa', height: 36, display: 'flex', alignItems: 'center', overflow: 'hidden' },
  ticker: {
    display: 'flex', gap: 48, animation: 'ticker 26s linear infinite', whiteSpace: 'nowrap',
    fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const,
    fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
  },
  nav: {
    position: 'sticky' as const, top: 0, zIndex: 1000, background: '#fafafa',
    borderBottom: '1px solid #f0f0f0', height: 72, display: 'flex', alignItems: 'center',
    transition: 'box-shadow 0.25s ease',
  },
  navScrolled: { boxShadow: '0 2px 24px rgba(0,0,0,0.07)' },
  navInner: {
    width: '100%', maxWidth: 1440, margin: '0 auto', padding: '0 32px',
    display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16,
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: 36, listStyle: 'none', margin: 0, padding: 0 },
  navItem: { position: 'relative' as const },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: '#0a0a0a',
    fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
    fontWeight: 500, fontFamily: "'Montserrat', sans-serif",
  },
  chevron: { width: 10, height: 10, transition: 'transform 0.2s ease' },
  chevronOpen: { transform: 'rotate(180deg)' },
  dropdown: {
    position: 'absolute' as const, top: 'calc(100% + 18px)', left: '50%',
    transform: 'translateX(-50%)', background: '#fafafa', border: '1px solid #f0f0f0',
    minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.09)', zIndex: 10,
  },
  dropdownLink: {
    display: 'block', padding: '11px 20px', fontSize: 11, letterSpacing: '0.1em',
    textTransform: 'uppercase' as const, color: '#0a0a0a', textDecoration: 'none',
    fontFamily: "'Montserrat', sans-serif", fontWeight: 400,
  },
  logo: {
    textAlign: 'center' as const, textDecoration: 'none', color: '#0a0a0a',
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
  },
  logoWord: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300,
    letterSpacing: '0.22em', textTransform: 'uppercase' as const, lineHeight: 1,
  },
  logoSub: {
    fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase' as const,
    fontWeight: 500, color: '#888', marginTop: 3, fontFamily: "'Montserrat', sans-serif",
  },
  actions: { display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#0a0a0a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 38, height: 38, borderRadius: '50%', position: 'relative' as const, transition: 'background 0.2s',
  },
  iconBtnHov: { background: '#f0f0f0' },
  cartBadge: {
    position: 'absolute' as const, top: 3, right: 3, width: 16, height: 16,
    background: '#0a0a0a', color: '#fafafa', borderRadius: '50%', fontSize: 9, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Montserrat', sans-serif",
  },
  wishDot: { position: 'absolute' as const, top: 4, right: 4, width: 7, height: 7, background: '#c0392b', borderRadius: '50%' },
  divider: { width: 1, height: 20, background: '#d8d8d8', margin: '0 4px' },
  bar: { display: 'block', width: 22, height: 1.5, background: '#0a0a0a', transition: 'all 0.28s ease' },
  bar1Open: { transform: 'translateY(6.5px) rotate(45deg)' },
  bar2Open: { opacity: 0 },
  bar3Open: { transform: 'translateY(-6.5px) rotate(-45deg)' },
  mobileBackdrop: {
    position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.3)',
    zIndex: 898, backdropFilter: 'blur(2px)',
  },
  mobileMenu: {
    position: 'fixed' as const, top: 108, left: 0, right: 0, bottom: 0,
    background: '#fafafa', zIndex: 899,
    padding: '0 0 40px', overflowY: 'auto' as const,
    transform: 'translateX(-100%)', transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
    borderTop: '1px solid #f0f0f0',
  },
  mobileMenuOpen: { transform: 'translateX(0)' },
  mobileTopRow: {
    display: 'flex', gap: 0, borderBottom: '1px solid #f0f0f0',
  },
  mobileIconBtn: {
    flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6,
    background: 'none', border: 'none', cursor: 'pointer', padding: '18px 8px',
    color: '#0a0a0a', borderRight: '1px solid #f0f0f0',
  },
  mobileIconLabel: { fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: "'Montserrat', sans-serif", fontWeight: 500 },
  mobileDivider: { height: 1, background: '#f0f0f0', margin: '0' },
  mobileLink: {
    display: 'block', fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300,
    letterSpacing: '0.06em', color: '#0a0a0a', textDecoration: 'none',
    padding: '14px 28px', borderBottom: '1px solid #f5f5f5', transition: 'opacity 0.15s',
  },
  mobileSub: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px 16px', padding: '10px 28px 16px' },
  mobileSubLink: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.12em',
    textTransform: 'uppercase' as const, color: '#888', textDecoration: 'none', transition: 'color 0.15s',
  },
  mobileFooter: { display: 'flex', gap: 24, padding: '20px 28px' },
  mobileFooterLink: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.1em',
    textTransform: 'uppercase' as const, color: '#888', textDecoration: 'none',
  },
};
