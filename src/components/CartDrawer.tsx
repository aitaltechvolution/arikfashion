import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    if (alertTimer.current) clearTimeout(alertTimer.current);
    alertTimer.current = setTimeout(() => setAlertMsg(null), 2400);
  };

  const handleQtyIncrease = (id: string, color: string, size: string, currentQty: number, max: number, name: string) => {
    if (currentQty + 1 > max) {
      triggerAlert(`Only ${max} unit${max === 1 ? '' : 's'} of "${name}" in stock`);
      return;
    }
    updateQuantity(id, color, size, currentQty + 1);
    triggerAlert(`Quantity updated to ${currentQty + 1}`);
  };

  const handleQtyDecrease = (id: string, color: string, size: string, currentQty: number, name: string) => {
    if (currentQty === 1) {
      removeFromCart(id, color, size);
      return;
    }
    updateQuantity(id, color, size, currentQty - 1);
    triggerAlert(`Quantity updated to ${currentQty - 1}`);
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
    setIsCartOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideInCart { from { transform: translateX(100%); opacity: 0.6; } to { transform: translateX(0); opacity: 1; } }
        @keyframes cartFadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; } }
        @keyframes cartAlertIn { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .cart-qty-btn {
          width: 30px; height: 30px; border: 1px solid #d4c9c0; background: #fff;
          cursor: pointer; font-size: 16px; display: flex; align-items: center;
          justify-content: center; transition: all 0.15s; color: #1a1a1a;
          font-family: 'Montserrat', sans-serif; border-radius: 2px;
        }
        .cart-qty-btn:hover { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .cart-remove-btn {
          background: none; border: none; cursor: pointer; font-size: 9px;
          letter-spacing: 0.14em; text-transform: uppercase; color: #b0a49a;
          font-family: 'Montserrat', sans-serif; text-decoration: underline;
          padding: 2px 0; transition: color 0.15s; margin-top: 6px; display: block;
        }
        .cart-remove-btn:hover { color: #c0392b; }
        .cart-checkout-btn {
          width: 100%; background: #1a1a1a; color: #fafafa; border: none;
          padding: 16px 0; font-family: 'Montserrat', sans-serif; font-size: 11px;
          letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700;
          cursor: pointer; transition: background 0.2s; margin-bottom: 12px;
        }
        .cart-checkout-btn:hover { background: #c9a96e; }
        .cart-link-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Montserrat', sans-serif; font-size: 9px; letter-spacing: 0.14em;
          text-transform: uppercase; text-decoration: underline; color: #8a7e76;
          transition: color 0.15s; padding: 0;
        }
        .cart-link-btn:hover { color: #1a1a1a; }
        .cart-clear-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Montserrat', sans-serif; font-size: 9px; letter-spacing: 0.14em;
          text-transform: uppercase; text-decoration: underline; color: #c0392b;
          transition: color 0.15s; padding: 0;
        }
        .cart-clear-btn:hover { color: #922b21; }
        .cart-close-btn {
          background: none; border: none; cursor: pointer; display: flex;
          align-items: center; justify-content: center; padding: 6px;
          color: #1a1a1a; border-radius: 2px; transition: background 0.15s;
        }
        .cart-close-btn:hover { background: #f0ece8; }
        .cart-item-row { transition: background 0.18s; border-bottom: 1px solid #ede5dc; }
        .cart-item-row:last-child { border-bottom: none; }
        .cart-drawer-scroll::-webkit-scrollbar { width: 3px; }
        .cart-drawer-scroll::-webkit-scrollbar-thumb { background: #d4c9c0; border-radius: 4px; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.5)',
          zIndex: 1800, animation: 'cartFadeIn 0.32s cubic-bezier(0.22,1,0.36,1)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 420, maxWidth: '100vw', height: '100%',
        background: '#faf8f5', zIndex: 1900,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-12px 0 60px rgba(0,0,0,0.14)',
        animation: 'slideInCart 0.4s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Alert Banner */}
        {alertMsg && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
            background: '#1a1a1a', color: '#faf8f5', padding: '12px 20px',
            fontFamily: "'Montserrat', sans-serif", fontSize: 11,
            letterSpacing: '0.12em', textAlign: 'center',
            animation: 'cartAlertIn 0.2s ease',
          }}>
            {alertMsg}
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 26px 18px', borderBottom: '1px solid #ede5dc', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: 24,
              fontWeight: 400, letterSpacing: '0.06em', color: '#1a1a1a',
            }}>Your Cart</span>
            {cart.length > 0 && (
              <span style={{
                fontFamily: "'Montserrat', sans-serif", fontSize: 10,
                letterSpacing: '0.1em', color: '#8a7e76',
              }}>
                {cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="cart-drawer-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 26px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: '#f0ece8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#b0a49a" strokeWidth="1.2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#1a1a1a', marginBottom: 6 }}>Nothing here yet</p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.14em', color: '#b0a49a', textTransform: 'uppercase' }}>
                  Your cart is empty
                </p>
              </div>
              <button className="cart-checkout-btn" style={{ width: 'auto', padding: '14px 36px', marginBottom: 0, marginTop: 8 }} onClick={() => navigate('/shop')}>
                Explore Shop
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.product.id}-${item.color}-${item.size}`} className="cart-item-row"
                style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 14, padding: '18px 0', alignItems: 'start' }}>
                {/* Image */}
                <div style={{ width: 80, height: 100, overflow: 'hidden', background: '#e8e0d8', flexShrink: 0 }}>
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>

                {/* Info */}
                <div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#1a1a1a', marginBottom: 3 }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#8a7e76', letterSpacing: '0.08em', marginBottom: 10 }}>
                    {item.color} · {item.size}{item.length ? ` · ${item.length}` : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="cart-qty-btn" onClick={() => handleQtyDecrease(item.product.id, item.color, item.size, item.quantity, item.product.name)}>−</button>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center', color: '#1a1a1a' }}>
                      {item.quantity}
                    </span>
                    <button className="cart-qty-btn" onClick={() => handleQtyIncrease(item.product.id, item.color, item.size, item.quantity, item.product.stock, item.product.name)}>+</button>
                  </div>
                  <button className="cart-remove-btn" onClick={() => removeFromCart(item.product.id, item.color, item.size)}>Remove</button>
                </div>

                {/* Price */}
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, paddingTop: 2, whiteSpace: 'nowrap', color: '#1a1a1a' }}>
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '18px 26px 30px', borderTop: '1px solid #ede5dc', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a7e76' }}>Subtotal</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, color: '#1a1a1a' }}>{formatPrice(cartTotal)}</span>
            </div>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.1em', color: '#b0a49a', textAlign: 'center', marginBottom: 16 }}>
              Shipping & taxes calculated at checkout
            </p>
            <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="cart-link-btn" onClick={() => setIsCartOpen(false)}>Continue Shopping</button>
              <button className="cart-clear-btn" onClick={() => { clearCart(); triggerAlert('Cart cleared'); }}>Clear Cart</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
