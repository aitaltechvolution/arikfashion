import React, { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '2349072297729'; // Replace with actual number
const WHATSAPP_MESSAGE = 'Hi! I found you on your website and I would love to know more about your products.';

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Show after scrolling 300px
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pulse animation every 5s
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 700);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible]);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <>
      <style>{`
        @keyframes wa-pop-in {
          from { opacity: 0; transform: scale(0.4) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes wa-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
          70%  { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); }
        }
        @keyframes wa-ripple {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .wa-btn {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(37,211,102,0.4), 0 2px 8px rgba(0,0,0,0.15);
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
          animation: wa-pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .wa-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,211,102,0.5), 0 4px 12px rgba(0,0,0,0.18);
        }
        .wa-btn.pulse {
          animation: wa-pulse 0.7s ease;
        }
        .wa-ripple {
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid #25D366;
          animation: wa-ripple 1.4s ease-out infinite;
          pointer-events: none;
        }
        .wa-tooltip {
          position: absolute;
          right: 68px;
          bottom: 50%;
          transform: translateY(50%);
          background: #0a0a0a;
          color: #fafafa;
          padding: 8px 14px;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          letter-spacing: 0.06em;
          white-space: nowrap;
          pointer-events: none;
          transition: opacity 0.2s, transform 0.2s;
        }
        .wa-tooltip::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-left-color: #0a0a0a;
        }
      `}</style>

      {visible && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`wa-btn${pulse ? ' pulse' : ''}`}
          aria-label="Chat on WhatsApp"
          onMouseEnter={() => setTooltip(true)}
          onMouseLeave={() => setTooltip(false)}
        >
          {/* Ripple rings */}
          <span className="wa-ripple" style={{ animationDelay: '0s' }} />
          <span className="wa-ripple" style={{ animationDelay: '0.5s' }} />

          {/* WhatsApp SVG logo */}
          <svg
            width="30"
            height="30"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.828 6.5L4 29l7.7-1.818A12.94 12.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3z"
              fill="white"
            />
            <path
              d="M21.5 18.7c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51-.17 0-.37-.01-.57-.01s-.52.08-.8.37c-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"
              fill="#25D366"
            />
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <span className="wa-tooltip">Chat with us</span>
          )}
        </a>
      )}
    </>
  );
}
