import React, { useState, useEffect, useRef } from 'react';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const values = [
    { num: '01', title: 'Authentically Nigerian', desc: 'Every stitch honours centuries of West African textile mastery — adire, aso-oke, ankara — reimagined for the modern wardrobe.' },
    { num: '02', title: 'Bespoke Quality', desc: 'Made to order. No mass production, no compromise. Each garment is sewn by skilled artisans in Lagos within 7–9 working days.' },
    { num: '03', title: 'Inclusive Sizing', desc: 'From XS to XXXL, we believe every body deserves to feel celebrated. Custom sizing is available on request.' },
    { num: '04', title: 'Sustainable Practice', desc: 'We source locally where possible, reducing our carbon footprint and reinvesting in Nigerian textile communities.' },
  ];

  const deliveryZones = [
    { region: 'Lagos & Abuja', time: '1–2 business days', icon: '🏙️' },
    { region: 'Other Nigerian States', time: '3–5 business days', icon: '📦' },
    { region: 'West Africa', time: '5–7 business days', icon: '🌍' },
    { region: 'UK & Europe', time: '7–12 business days', icon: '✈️' },
    { region: 'USA & Canada', time: '8–14 business days', icon: '🌎' },
    { region: 'Rest of World', time: '10–16 business days', icon: '🌐' },
  ];

  return (
    <main style={{ background: '#fafafa', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={s.hero}>
        <div style={{
          ...s.heroInner,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(24px)',
          transition: 'all 0.8s ease 0.1s',
        }}>
          <p style={s.heroEyebrow}>Est. Lagos, 2014</p>
          <h1 style={s.heroTitle}>Fashion Born<br />From the Soil</h1>
          <p style={s.heroSub}>
            We are Aital Fashion — a Lagos-based luxury label crafting contemporary African wear
            for women who refuse to be invisible.
          </p>
        </div>
        <div style={s.heroLine} />
      </div>

      {/* Story */}
      <div style={s.container}>
        <RevealSection style={s.storyGrid}>
          <div style={s.storyImgWrap}>
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80"
              alt="Aital Fashion atelier"
              style={s.storyImg}
            />
            <div style={s.storyImgCaption}>Our Lagos Atelier, 2024</div>
          </div>
          <div>
            <p style={s.eyebrow}>Our Story</p>
            <h2 style={s.sectionTitle}>A Decade of<br />Dressing Lagos</h2>
            <p style={s.bodyText}>
              Aital Fashion was born in 2014 in a small studio on Lagos Island, with a single Singer sewing machine and an audacious belief: that Nigerian women deserved clothes designed specifically for them — their bodies, their heat, their occasions, their pride.
            </p>
            <p style={s.bodyText}>
              What began as bespoke wedding and event wear has grown into a full ready-to-order brand, shipping to over 40 countries. We have dressed entrepreneurs, artists, diplomats, and mothers — united by a desire to wear their heritage beautifully.
            </p>
            <p style={s.bodyText}>
              Today, our team of 24 artisans operates from our expanded Lekki Phase I studio, each garment hand-cut and sewn to order.
            </p>
            <div style={s.statsRow}>
              {[['10+', 'Years'], ['24', 'Artisans'], ['40+', 'Countries'], ['5,000+', 'Clients']].map(([num, label]) => (
                <div key={label} style={s.statItem}>
                  <span style={s.statNum}>{num}</span>
                  <span style={s.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>

      {/* Values */}
      <div style={s.valuesSection}>
        <div style={s.container}>
          <RevealSection>
            <p style={{ ...s.eyebrow, textAlign: 'center' }}>What We Stand For</p>
            <h2 style={{ ...s.sectionTitle, textAlign: 'center', marginBottom: 52 }}>Our Values</h2>
          </RevealSection>
          <div style={s.valuesGrid}>
            {values.map((v, i) => (
              <RevealSection key={v.num} delay={i * 80}>
                <div style={s.valueCard}>
                  <span style={s.valueNum}>{v.num}</span>
                  <h3 style={s.valueTitle}>{v.title}</h3>
                  <p style={s.valueDesc}>{v.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>

      {/* Process */}
      <div style={s.processSection}>
        <div style={s.container}>
          <RevealSection>
            <p style={{ ...s.eyebrow, textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>How We Work</p>
            <h2 style={{ ...s.sectionTitle, textAlign: 'center', color: '#fff', marginBottom: 52 }}>From Sketch to Wardrobe</h2>
          </RevealSection>
          <div style={s.processSteps}>
            {[
              { step: '1', title: 'Browse & Select', desc: 'Choose your style, colour, and size from our curated collection.' },
              { step: '2', title: 'Order Confirmed', desc: 'We receive your order and assign it to one of our skilled artisans.' },
              { step: '3', title: 'Crafted by Hand', desc: 'Your piece is cut, sewn, and finished to our exacting standards (7–9 days).' },
              { step: '4', title: 'Shipped to You', desc: 'Nationwide delivery & worldwide shipping to 40+ countries.' },
            ].map((step, i) => (
              <RevealSection key={step.step} delay={i * 90} style={s.processStep}>
                <div style={s.processNum}>{step.step}</div>
                <h3 style={s.processTitle}>{step.title}</h3>
                <p style={s.processDesc}>{step.desc}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div style={s.container}>
        <div style={{ paddingTop: 80, paddingBottom: 80 }}>
          <RevealSection>
            <p style={{ ...s.eyebrow, textAlign: 'center' }}>We Come to You</p>
            <h2 style={{ ...s.sectionTitle, textAlign: 'center', marginBottom: 16 }}>Delivery Worldwide</h2>
            <p style={{ ...s.bodyText, textAlign: 'center', maxWidth: 560, margin: '0 auto 52px' }}>
              Whether you are in Lagos or London, New York or Nairobi — we deliver. Free nationwide shipping on orders above ₦50,000. International rates calculated at checkout.
            </p>
          </RevealSection>
          <div style={s.deliveryGrid}>
            {deliveryZones.map((zone, i) => (
              <RevealSection key={zone.region} delay={i * 60}>
                <div style={s.deliveryCard}>
                  <span style={s.deliveryIcon}>{zone.icon}</span>
                  <div>
                    <p style={s.deliveryRegion}>{zone.region}</p>
                    <p style={s.deliveryTime}>{zone.time}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
          <RevealSection delay={400}>
            <p style={{ ...s.bodyText, textAlign: 'center', marginTop: 28, fontSize: 13, color: '#888' }}>
              * All timelines are post-production. Express shipping available on request. Contact us via WhatsApp.
            </p>
          </RevealSection>
        </div>
      </div>

      {/* CTA */}
      <div style={s.ctaSection}>
        <RevealSection>
          <p style={s.ctaEyebrow}>Ready to Wear Your Heritage?</p>
          <h2 style={s.ctaTitle}>Explore the Collection</h2>
          <div style={s.ctaBtns}>
            <a href="/shop" style={s.ctaBtnPrimary}>Shop Now</a>
            <a href="https://wa.me/2349072297729" target="_blank" rel="noreferrer" style={s.ctaBtnSecondary}>WhatsApp Us</a>
          </div>
        </RevealSection>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px, 5vw, 64px)' },
  hero: { background: '#0a0a0a', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden' },
  heroInner: { textAlign: 'center', zIndex: 1, position: 'relative' },
  heroEyebrow: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 20 },
  heroTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 300, color: '#fff', letterSpacing: '0.04em', lineHeight: 1.05, marginBottom: 24 },
  heroSub: { fontFamily: "'Montserrat', sans-serif", fontSize: 15, lineHeight: 1.9, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', maxWidth: 480, margin: '0 auto' },
  heroLine: { position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 1, height: 60, background: 'linear-gradient(to bottom, transparent, #c9a84c)' },
  storyGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, paddingTop: 100, paddingBottom: 100, alignItems: 'center' },
  storyImgWrap: { position: 'relative' },
  storyImg: { width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' },
  storyImgCaption: { position: 'absolute', bottom: -16, right: -16, background: '#c9a84c', color: '#0a0a0a', fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 14px' },
  eyebrow: { fontFamily: "'Montserrat', sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 14 },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: '#0a0a0a', lineHeight: 1.1, letterSpacing: '0.03em', marginBottom: 24 },
  bodyText: { fontFamily: "'Montserrat', sans-serif", fontSize: 14, lineHeight: 1.95, color: '#444', letterSpacing: '0.04em', marginBottom: 16 },
  statsRow: { display: 'flex', gap: 0, marginTop: 36, borderTop: '1px solid #f0f0f0', paddingTop: 28 },
  statItem: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, paddingRight: 16 },
  statNum: { fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: '#0a0a0a', lineHeight: 1 },
  statLabel: { fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#888' },
  valuesSection: { background: '#f5f5f5', padding: '80px 0' },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 },
  valueCard: { background: '#fff', padding: '36px 28px' },
  valueNum: { fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#f0f0f0', display: 'block', lineHeight: 1, marginBottom: 14 },
  valueTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#0a0a0a', marginBottom: 12, letterSpacing: '0.02em' },
  valueDesc: { fontFamily: "'Montserrat', sans-serif", fontSize: 13, lineHeight: 1.85, color: '#555', letterSpacing: '0.04em' },
  teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 },
  teamCard: { background: '#fff', overflow: 'hidden' },
  teamImgWrap: { overflow: 'hidden', paddingBottom: '110%', position: 'relative' },
  teamImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' },
  teamInfo: { padding: '24px 24px 28px' },
  teamName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#0a0a0a', marginBottom: 4, letterSpacing: '0.02em' },
  teamRole: { fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 },
  teamBio: { fontFamily: "'Montserrat', sans-serif", fontSize: 13, lineHeight: 1.8, color: '#555', letterSpacing: '0.03em' },
  processSection: { background: '#0a0a0a', padding: '80px 0' },
  processSteps: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 },
  processStep: { padding: '36px 28px', borderRight: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' },
  processNum: { width: 52, height: 52, border: '1px solid #c9a84c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#c9a84c' },
  processTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: '#fff', marginBottom: 12, letterSpacing: '0.02em' },
  processDesc: { fontFamily: "'Montserrat', sans-serif", fontSize: 13, lineHeight: 1.85, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em' },
  deliveryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  deliveryCard: { display: 'flex', gap: 16, alignItems: 'center', background: '#fff', padding: '20px 24px', border: '1px solid #f0f0f0' },
  deliveryIcon: { fontSize: 28, flexShrink: 0 },
  deliveryRegion: { fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#0a0a0a', marginBottom: 2 },
  deliveryTime: { fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' },
  ctaSection: { background: '#0a0a0a', padding: '80px 24px', textAlign: 'center' },
  ctaEyebrow: { fontFamily: "'Montserrat', sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 16 },
  ctaTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: '#fff', letterSpacing: '0.04em', marginBottom: 36 },
  ctaBtns: { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtnPrimary: { background: '#c9a84c', color: '#0a0a0a', border: 'none', padding: '14px 40px', fontSize: 12, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700, cursor: 'pointer', display: 'inline-block' },
  ctaBtnSecondary: { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '14px 40px', fontSize: 12, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-block' },
};
