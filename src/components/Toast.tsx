import React from 'react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toast } = useCart();

  return (
    <div style={{
      ...styles.toast,
      ...(toast ? styles.visible : styles.hidden),
    }}>
      {toast}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#0a0a0a',
    color: '#fafafa',
    padding: '12px 28px',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 500,
    zIndex: 9999,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },
  visible: { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
  hidden: { opacity: 0, transform: 'translateX(-50%) translateY(10px)' },
};
