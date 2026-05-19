import React, { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subbed, setSubbed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubbed(true); setEmail(''); }
  };

  const year = new Date().getFullYear();

  return (
    <footer style={s.footer}>
      {/* Newsletter Strip */}
      <div style={s.newsletter}>
        <div className="newsletter-inner" style={s.newsletterInner}>
          <div>
            <p style={s.newsletterEyebrow}>Stay in the Loop</p>
            <h3 style={s.newsletterTitle}>Join Our Inner Circle</h3>
            <p style={s.newsletterSub}>New arrivals, exclusive offers & style notes — delivered to your inbox.</p>
          </div>
          {subbed ? (
            <div style={s.subbedMsg}>
              <span style={s.subbedCheck}>✓</span>
              <span>You're on the list — thank you!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form" style={s.newsletterForm}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={s.newsletterInput}
              />
              <button type="submit" style={s.newsletterBtn}>Subscribe</button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div style={s.mainFooter}>
        <div style={s.container}>
          <div className="footer-grid" style={s.footerGrid}>

            {/* Brand Column */}
            <div style={s.brandCol}>
              <a href="/" style={s.footerLogo}>ARIK<br />FASHION</a>
              <p style={s.brandTagline}>Contemporary African luxury, crafted in Lagos — worn worldwide.</p>
              <div style={s.socialRow}>
                <a href="https://wa.me/2349072297729" target="_blank" rel="noreferrer" title="WhatsApp" style={s.socialBtn} aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.998 0C5.374 0 0 5.373 0 12c0 2.117.554 4.107 1.523 5.832L.057 23.885a.5.5 0 00.609.61l6.098-1.456A11.934 11.934 0 0012 24c6.626 0 12-5.373 12-12S18.624 0 11.998 0zm.002 21.818a9.818 9.818 0 01-5.015-1.374l-.36-.214-3.724.89.92-3.619-.234-.373A9.818 9.818 0 012.182 12C2.182 6.57 6.569 2.182 12 2.182S21.818 6.569 21.818 12 17.431 21.818 12 21.818z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram" style={s.socialBtn} aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook" style={s.socialBtn} aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" title="TikTok" style={s.socialBtn} aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              </div>
              <div style={s.paymentRow}>
                {/* Mastercard */}
                <div style={s.paymentBadge} title="Mastercard">
                  <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="#1a1a1a"/>
                    <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                    <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
                    <path d="M19 6.8a7 7 0 010 10.4A7 7 0 0119 6.8z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* Visa */}
                <div style={s.paymentBadge} title="Visa">
                  <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="#1a1a1a"/>
                    <text x="19" y="16" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" fontStyle="italic" fill="#1A1F71" letterSpacing="0.5">VISA</text>
                    <text x="19" y="16" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" fontStyle="italic" fill="white" letterSpacing="0.5" opacity="0.9">VISA</text>
                  </svg>
                </div>
                {/* Verve */}
                <div style={s.paymentBadge} title="Verve">
                  <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="4" fill="#1a1a1a"/>
                    <rect x="4" y="8" width="30" height="8" rx="2" fill="#E30613"/>
                    <text x="19" y="15.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" fontWeight="bold" fill="white" letterSpacing="0.8">VERVE</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={s.colTitle}>Quick Links</h4>
              <ul style={s.linkList}>
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Shop', href: '/shop' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Wishlist', href: '/account/wishlist' },
                  { label: 'Login / Register', href: '/account' },
                ].map(link => (
                  <li key={link.label}><a href={link.href} style={s.footerLink}>{link.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 style={s.colTitle}>Customer Care</h4>
              <ul style={s.linkList}>
                {[
                  { label: 'Return Policy', href: '#' },
                  { label: 'Track My Order', href: '/account/orders' },
                  { label: 'FAQ', href: '#' },
                  { label: 'Custom Orders', href: '/contact' },
                ].map(link => (
                  <li key={link.label}><a href={link.href} style={s.footerLink}>{link.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={s.colTitle}>Get in Touch</h4>
              <div style={s.contactBlock}>
                {[
                  { icon: '📍', label: 'Studio Address', val: '4 Adeleke Street, Benjamin\nEleyele, Ibadan, Oyo State', href: 'https://maps.google.com' },
                  { icon: '📞', label: 'WhatsApp & Calls', val: '+234 907 229 7729', href: 'tel:+2349072297729' },
                  { icon: '✉️', label: 'Email', val: 'arikfashion.ng@gmail.com', href: 'mailto:arikfashion.ng@gmail.com' },
                  { icon: '⏰', label: 'Studio Hours', val: 'Mon–Sat: 9am – 6pm WAT', href: null },
                ].map(item => (
                  <div key={item.label} style={s.contactItem}>
                    <span style={s.contactIcon}>{item.icon}</span>
                    <div>
                      <p style={s.contactLabel}>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} style={s.contactValLink}>{item.val}</a>
                      ) : (
                        <p style={s.contactVal}>{item.val}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Banner */}
          <div className="shipping-banner" style={s.shippingBanner}>
            {[
              { icon: '🚚', text: 'Free Nationwide Delivery on Orders ₦50,000+' },
              { icon: '🌍', text: 'International Shipping to 40+ Countries' },
              { icon: '🔒', text: 'Secure Payments — Mastercard, Visa, Verve' },
              { icon: '↩️', text: 'Hassle-Free Returns within 14 Days' },
            ].map((item, i) => (
              <React.Fragment key={item.text}>
                {i > 0 && <div className="shipping-divider-el" style={s.shippingDivider} />}
                <div style={s.shippingItem}>
                  <span style={s.shippingIcon}>{item.icon}</span>
                  <span style={s.shippingText}>{item.text}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="bottom-bar" style={s.bottomBar}>
            <p style={s.copyright}>© {year} Arik Fashion. All rights reserved.</p>
            <div style={s.legalLinks}>
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' },
              ].map((l, i) => (
                <React.Fragment key={l.href}>
                  {i > 0 && <span style={s.legalDot}>·</span>}
                  <a href={l.href} style={s.legalLink}>{l.label}</a>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const s: Record<string, React.CSSProperties> = {
  footer: { marginTop: 0 },

  /* Newsletter */
  newsletter: { background: '#0a0a0a', padding: '52px 0' },
  newsletterInner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px, 5vw, 64px)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap',
  },
  newsletterEyebrow: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.28em',
    textTransform: 'uppercase', color: '#c9a84c', marginBottom: 8,
  },
  newsletterTitle: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 300,
    color: '#fff', letterSpacing: '0.04em', marginBottom: 8,
  },
  newsletterSub: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 12, /* ↑ was 10 */
    color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', lineHeight: 1.75,
  },
  newsletterForm: { display: 'flex', gap: 0, minWidth: 340, flexShrink: 0 },
  newsletterInput: {
    flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
    borderRight: 'none', padding: '13px 18px', color: '#fff',
    fontFamily: "'Montserrat', sans-serif", fontSize: 13, letterSpacing: '0.04em', outline: 'none',
  },
  newsletterBtn: {
    background: '#c9a84c', color: '#0a0a0a', border: 'none', padding: '13px 24px',
    fontSize: 11, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.16em',
    textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  },
  subbedMsg: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: '#c9a84c', letterSpacing: '0.06em' },
  subbedCheck: { fontSize: 18 },

  /* Main footer */
  mainFooter: { background: '#111', paddingTop: 60, paddingBottom: 0 },
  container: { maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px, 5vw, 64px)' },
  footerGrid: {
    display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr',
    gap: 48, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  brandCol: {},
  footerLogo: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300,
    color: '#fff', letterSpacing: '0.12em', lineHeight: 1.15, textDecoration: 'none',
    display: 'inline-block', marginBottom: 16,
  },
  brandTagline: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 12, /* ↑ was 10 */
    lineHeight: 1.85, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', marginBottom: 24, maxWidth: 240,
  },
  socialRow: { display: 'flex', gap: 8, marginBottom: 24 },
  socialBtn: {
    width: 36, height: 36, border: '1px solid rgba(255,255,255,0.15)', background: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, fontFamily: 'serif',
    textDecoration: 'none', cursor: 'pointer',
  },
  paymentRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  paymentBadge: {
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  colTitle: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 10, /* ↑ was 8 */
    letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 20, fontWeight: 700,
  },
  linkList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 },
  footerLink: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 13, /* ↑ was 10 */
    letterSpacing: '0.04em', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.15s',
  },
  contactBlock: { display: 'flex', flexDirection: 'column', gap: 16 },
  contactItem: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  contactIcon: { fontSize: 15, marginTop: 1, flexShrink: 0 },
  contactLabel: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 10, /* ↑ was 8 */
    letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 3,
  },
  contactVal: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 12, /* ↑ was 10 */
    lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.03em',
  },
  contactValLink: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 12, /* ↑ was 10 */
    color: 'rgba(255,255,255,0.6)', textDecoration: 'none', letterSpacing: '0.03em',
  },

  /* Shipping banner */
  shippingBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '22px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12,
  },
  shippingItem: { display: 'flex', alignItems: 'center', gap: 8 },
  shippingIcon: { fontSize: 15 },
  shippingText: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 11, /* ↑ was 9 */
    letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
  },
  shippingDivider: { width: 1, height: 18, background: 'rgba(255,255,255,0.1)' },

  /* Bottom bar */
  bottomBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 0', flexWrap: 'wrap', gap: 12,
  },
  copyright: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 11, /* ↑ was 9 */
    letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)',
  },
  legalLinks: { display: 'flex', alignItems: 'center', gap: 10 },
  legalLink: {
    fontFamily: "'Montserrat', sans-serif", fontSize: 11, /* ↑ was 9 */
    letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
  },
  legalDot: { color: 'rgba(255,255,255,0.15)', fontSize: 10 },
};
