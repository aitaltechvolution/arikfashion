import React, { useState } from 'react';
import { getSupabase } from '../lib/supabase';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setSendError(null);
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        subject: form.subject || null,
        message: form.message,
        status: 'new',
      });
      if (error) {
        setSendError('Could not send message. Please try again.');
        setSending(false);
        return;
      }
    }
    setSending(false);
    setSent(true);
  };

  return (
    <>
      <style>{`
        @keyframes contactFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .contact-input {
          width: 100%; padding: 13px 16px; border: 1px solid #d4c9c0; background: #fff;
          font-family: 'Montserrat', sans-serif; font-size: 14px; color: #1a1a1a;
          outline: none; transition: border-color 0.2s; appearance: none;
        }
        .contact-input:focus { border-color: #c9a96e; }
        .contact-input::placeholder { color: #c0b8b0; }
        .contact-send-btn {
          background: #1a1a1a; color: #fafafa; border: none; padding: 15px 40px;
          font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 0.2em;
          text-transform: uppercase; font-weight: 700; cursor: pointer; transition: background 0.2s;
        }
        .contact-send-btn:hover:not(:disabled) { background: #c9a96e; }
        .contact-send-btn:disabled { background: #d4c9c0; cursor: not-allowed; }
        .contact-info-link { display: flex; align-items: center; gap: 12px; font-family: 'Montserrat', sans-serif; font-size: 14px; color: #1a1a1a; text-decoration: none; transition: color 0.15s; }
        .contact-info-link:hover { color: #c9a96e; }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-hero-text { font-size: 42px !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{
        background: '#1a1a1a', color: '#faf8f5', padding: '80px 20px 70px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 0%, rgba(201,169,110,0.15) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 16 }}>
            We'd love to hear from you
          </p>
          <h1 className="contact-hero-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 58, fontWeight: 400, letterSpacing: '0.04em', color: '#faf8f5', marginBottom: 18, lineHeight: 1.1 }}>
            Get in Touch
          </h1>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: '#8a7e76', letterSpacing: '0.08em', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
            Questions about an order, a design enquiry, or just want to say hello — we're here.
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '64px 20px 80px' }}>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 56, alignItems: 'start' }}>

          {/* ── Form ── */}
          <div style={{ animation: 'contactFadeUp 0.4s ease' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: '#1a1a1a', marginBottom: 28 }}>
              Send us a message
            </h2>

            {sent ? (
              <div style={{ background: '#f0f8f0', border: '1px solid #a8d5a2', padding: '32px 28px', textAlign: 'center', animation: 'contactFadeUp 0.3s ease' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e8f5e8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#1a1a1a', marginBottom: 8 }}>Message received!</p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: '#6a5e56', letterSpacing: '0.06em', lineHeight: 1.7 }}>
                  Thank you for reaching out. We typically reply within 1–2 business days.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6a5e56', marginBottom: 7 }}>
                      Full Name <span style={{ color: '#c9a96e' }}>*</span>
                    </label>
                    <input className="contact-input" value={form.name} onChange={set('name')} placeholder="Amara Okafor" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6a5e56', marginBottom: 7 }}>
                      Email Address <span style={{ color: '#c9a96e' }}>*</span>
                    </label>
                    <input className="contact-input" type="email" value={form.email} onChange={set('email')} placeholder="amara@email.com" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6a5e56', marginBottom: 7 }}>
                    Subject
                  </label>
                  <select className="contact-input" value={form.subject} onChange={set('subject')}>
                    <option value="">Select a topic...</option>
                    <option>Order enquiry</option>
                    <option>Returns & exchanges</option>
                    <option>Custom design request</option>
                    <option>Wholesale / partnership</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6a5e56', marginBottom: 7 }}>
                    Message <span style={{ color: '#c9a96e' }}>*</span>
                  </label>
                  <textarea
                    className="contact-input"
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell us how we can help..."
                    rows={6}
                    style={{ resize: 'vertical', lineHeight: 1.7 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                  <button className="contact-send-btn" disabled={sending || !form.name || !form.email || !form.message} onClick={handleSubmit}>
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                  {sendError && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#c0392b', marginTop: 8 }}>{sendError}</p>}
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: '#b0a49a', letterSpacing: '0.06em' }}>
                    We reply within 1–2 business days
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Info Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Store details */}
            <div style={{ background: '#1a1a1a', padding: '32px 28px', color: '#faf8f5', marginBottom: 2 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, marginBottom: 24, color: '#faf8f5' }}>
                Our Store
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <a href="https://maps.google.com" target="_blank" rel="noopener" className="contact-info-link" style={{ color: '#d4c9c0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 600, marginBottom: 2, color: '#faf8f5' }}>Visit Us</div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: '#8a7e76', lineHeight: 1.6 }}>4 Adeleke Street, Benjamin<br />Eleyele, Ibadan, Oyo State</div>
                  </div>
                </a>

                <a href="tel:+2349072297729" className="contact-info-link" style={{ color: '#d4c9c0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 600, marginBottom: 2, color: '#faf8f5' }}>Call Us</div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#8a7e76' }}>+234 907 229 7729</div>
                  </div>
                </a>

                <a href="mailto:arikfashion.ng@gmail.com" className="contact-info-link" style={{ color: '#d4c9c0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 600, marginBottom: 2, color: '#faf8f5' }}>Email Us</div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#8a7e76' }}>arikfashion.ng@gmail.com</div>
                  </div>
                </a>

                <a href="https://wa.me/2349072297729" target="_blank" rel="noopener" className="contact-info-link" style={{ color: '#d4c9c0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9a96e"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 600, marginBottom: 2, color: '#faf8f5' }}>WhatsApp</div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#8a7e76' }}>Chat with us directly</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Hours */}
            <div style={{ background: '#f0ece8', padding: '24px 28px', marginBottom: 2 }}>
              <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: 16, fontWeight: 700 }}>
                Store Hours
              </h4>
              {[
                { day: 'Mon – Fri', hours: '9:00 AM – 6:00 PM' },
                { day: 'Saturday', hours: '10:00 AM – 5:00 PM' },
                { day: 'Sunday', hours: 'Closed' },
              ].map(row => (
                <div key={row.day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: '#6a5e56' }}>{row.day}</span>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: row.hours === 'Closed' ? '#c0392b' : '#1a1a1a', fontWeight: 600 }}>{row.hours}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div style={{ background: '#faf8f5', border: '1px solid #ede5dc', padding: '20px 28px' }}>
              <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: 14, fontWeight: 700 }}>
                Follow Us
              </h4>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Instagram', href: 'https://instagram.com', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
                  { label: 'TikTok', href: 'https://tiktok.com', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" /></svg> },
                  { label: 'Facebook', href: 'https://facebook.com', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg> },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener"
                    style={{ width: 38, height: 38, border: '1px solid #d4c9c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1a1a', transition: 'all 0.15s', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1a1a1a'; (e.currentTarget as HTMLElement).style.color = '#faf8f5'; (e.currentTarget as HTMLElement).style.borderColor = '#1a1a1a'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#1a1a1a'; (e.currentTarget as HTMLElement).style.borderColor = '#d4c9c0'; }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
