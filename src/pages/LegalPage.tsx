import React, { useEffect, useState } from 'react';

type Kind = 'privacy' | 'terms' | 'cookies';

const CONTENT: Record<Kind, { title: string; eyebrow: string; updated: string; sections: { h: string; p: string[] }[] }> = {
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    updated: 'January 2026',
    sections: [
      { h: 'Introduction', p: [
        'Arik Fashion ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you visit arikfashion.com or make a purchase from us.',
      ]},
      { h: 'Information We Collect', p: [
        'We collect information you provide directly to us, including your name, email address, shipping address, billing address, phone number, and payment details when you create an account or place an order.',
        'We also automatically collect certain information about your device and browsing activity, including IP address, browser type, pages viewed, and the date and time of your visit.',
      ]},
      { h: 'How We Use Your Information', p: [
        'We use your information to process and fulfil orders, provide customer support, send order confirmations and updates, personalize your shopping experience, and — with your consent — send marketing communications about new collections and offers.',
      ]},
      { h: 'Sharing Your Information', p: [
        'We do not sell your personal information. We share information only with trusted service providers (payment processors, shipping carriers, analytics providers) who help us run the business, and where required by law.',
      ]},
      { h: 'Your Rights', p: [
        'You have the right to access, correct, or delete your personal information, and to opt out of marketing emails at any time. To exercise these rights, contact us at privacy@arikfashion.com.',
      ]},
      { h: 'Data Security', p: [
        'We use industry-standard safeguards including SSL encryption and PCI-compliant payment processing to protect your information.',
      ]},
      { h: 'Contact Us', p: [
        'Questions about this Privacy Policy? Email us at privacy@arikfashion.com.',
      ]},
    ],
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    updated: 'January 2026',
    sections: [
      { h: 'Agreement', p: [
        'By accessing or using arikfashion.com, you agree to these Terms of Service. If you do not agree, please do not use the site.',
      ]},
      { h: 'Products & Pricing', p: [
        'We strive to display product colors, sizes, and details accurately, but slight variations may occur. All prices are listed in Nigerian Naira (₦) and are subject to change without notice. We reserve the right to limit quantities and refuse orders.',
      ]},
      { h: 'Orders & Payment', p: [
        'Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order. Payment must be received in full before items are dispatched. We accept Mastercard, Visa, and Verve.',
      ]},
      { h: 'Shipping & Delivery', p: [
        'Estimated delivery times are provided at checkout. Risk of loss transfers to you upon delivery. We are not responsible for delays caused by carriers or events outside our control.',
      ]},
      { h: 'Returns & Exchanges', p: [
        'Unworn items in original condition with tags attached may be returned within 14 days of delivery. Sale items and intimates are final sale. See our returns page for full details.',
      ]},
      { h: 'Intellectual Property', p: [
        'All content on this site — including text, images, logos, and designs — is owned by Arik Fashion and protected by copyright and trademark law. You may not reproduce, distribute, or use any content without our written permission.',
      ]},
      { h: 'Limitation of Liability', p: [
        'To the fullest extent permitted by law, Arik Fashion shall not be liable for any indirect, incidental, or consequential damages arising from the use of this site or our products.',
      ]},
      { h: 'Governing Law', p: [
        'These Terms are governed by the laws of the Federal Republic of Nigeria.',
      ]},
    ],
  },
  cookies: {
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    updated: 'January 2026',
    sections: [
      { h: 'What Are Cookies?', p: [
        'Cookies are small text files placed on your device when you visit a website. They help the site remember your actions and preferences (such as login, cart items, and language) so you don\'t have to re-enter them every time.',
      ]},
      { h: 'Types of Cookies We Use', p: [
        'Essential cookies — required for the site to function (cart, checkout, account login).',
        'Performance cookies — help us understand how visitors interact with the site so we can improve it.',
        'Functional cookies — remember your preferences (size, region, recently viewed items).',
        'Marketing cookies — used with your consent to show you relevant offers on other sites.',
      ]},
      { h: 'Managing Cookies', p: [
        'You can control cookies through your browser settings. Disabling essential cookies may affect site functionality (for example, the cart may not work).',
      ]},
      { h: 'Third-Party Cookies', p: [
        'Some cookies are set by trusted third parties — including payment processors and analytics services. These third parties have their own privacy and cookie policies.',
      ]},
      { h: 'Updates', p: [
        'We may update this Cookie Policy from time to time. The "Last updated" date above indicates when changes were made.',
      ]},
      { h: 'Contact', p: [
        'Questions? Email privacy@arikfashion.com.',
      ]},
    ],
  },
};

export default function LegalPage({ kind }: { kind: Kind }) {
  const data = CONTENT[kind];
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <main style={{ minHeight: '80vh', background: '#fafafa' }}>
      {/* Breadcrumb */}
      <div style={s.crumbBar}>
        <div style={s.container}>
          <nav style={s.crumb}>
            <a href="/" style={s.crumbLink}>Home</a>
            <span style={s.crumbSep}>/</span>
            <span style={s.crumbCurrent}>{data.title}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section style={s.header}>
        <div style={s.container}>
          <p style={{ ...s.eyebrow, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all .5s ease' }}>{data.eyebrow}</p>
          <h1 className="legal-title" style={{ ...s.title, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(12px)', transition: 'all .55s ease .05s' }}>{data.title}</h1>
          <p style={{ ...s.updated, opacity: mounted ? 1 : 0, transition: 'opacity .55s ease .1s' }}>Last updated: {data.updated}</p>
        </div>
      </section>

      {/* Content */}
      <section style={s.body}>
        <div style={s.container}>
          <article style={s.article}>
            {data.sections.map((sec, i) => (
              <div key={sec.h} style={{ marginBottom: 36, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(10px)', transition: `all .5s ease ${0.1 + i * 0.04}s` }}>
                <h2 style={s.h2}>{sec.h}</h2>
                {sec.p.map((para, j) => (
                  <p key={j} style={s.p}>{para}</p>
                ))}
              </div>
            ))}

            <div style={s.legalFootRow}>
              <a href="/privacy" style={s.relatedLink}>Privacy Policy</a>
              <span style={s.dot}>·</span>
              <a href="/terms" style={s.relatedLink}>Terms of Service</a>
              <span style={s.dot}>·</span>
              <a href="/cookies" style={s.relatedLink}>Cookie Policy</a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 880, margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)' },
  crumbBar: { background: '#f5f5f5', borderBottom: '1px solid #ebebeb', padding: '10px 0' },
  crumb: { display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5a5a5a' },
  crumbLink: { textDecoration: 'none', color: '#4a4a4a' },
  crumbSep: { color: '#ccc' },
  crumbCurrent: { color: '#0a0a0a', fontWeight: 600 },
  header: { padding: 'clamp(48px, 8vw, 96px) 0 clamp(24px, 4vw, 40px)' },
  eyebrow: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#4a4a4a', marginBottom: 18 },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 400, letterSpacing: '0.04em', color: '#0a0a0a', lineHeight: 1.05, marginBottom: 16 },
  updated: { fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.06em', color: '#4a4a4a' },
  body: { paddingBottom: 'clamp(64px, 10vw, 120px)' },
  article: { background: '#fff', border: '1px solid #f0f0f0', padding: 'clamp(28px, 5vw, 56px)' },
  h2: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(20px, 2.6vw, 26px)', fontWeight: 500, letterSpacing: '0.03em', color: '#0a0a0a', marginBottom: 12 },
  p: { fontFamily: "'Montserrat', sans-serif", fontSize: 13, lineHeight: 1.9, color: '#2a2a2a', letterSpacing: '0.02em', marginBottom: 10 },
  legalFootRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0', fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.08em' },
  relatedLink: { color: '#0a0a0a', textDecoration: 'none', borderBottom: '1px solid #0a0a0a', paddingBottom: 1 },
  dot: { color: '#bbb' },
};
