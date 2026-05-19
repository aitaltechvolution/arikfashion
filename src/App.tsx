import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import WhatsAppFloat from './components/WhatsAppFloat';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import AccountPage from './pages/AccountPage';
import LegalPage from './pages/LegalPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import {
  AdminOrders, AdminOrderDetail, AdminCustomers, AdminEnquiries,
  AdminReviews, AdminShipping, AdminDiscounts, AdminSettings,
} from './pages/admin/AdminPages';

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fafafa; color: #0a0a0a; -webkit-font-smoothing: antialiased; }
  img { display: block; max-width: 100%; }
  button { font-family: inherit; }
  a { color: inherit; }

  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes scrollPulse {
    0%, 100% { opacity: 0.25; }
    50%       { opacity: 0.7; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .nav-dropdown-link:hover { background: #f0f0f0; }
  .quick-add:hover { background: rgba(10,10,10,1) !important; }
  .view-all-btn:hover { background: #0a0a0a; color: #fafafa; }
  .cat-card:hover img { transform: scale(1.06); }
  .ig-item:hover .ig-hover { opacity: 1 !important; }
  .ig-item:hover img { transform: scale(1.05); }

  /* ── NAVBAR RESPONSIVE ── */
  @media (max-width: 900px) {
    .nav-links-desktop { display: none !important; }
    .hamburger-btn { display: flex !important; }
    /* hide desktop-only icon buttons on very small */
    .nav-icon-wish, .nav-icon-account, .nav-divider { display: none !important; }
  }
  @media (max-width: 640px) {
    .nav-inner-grid { padding: 0 16px !important; }
    .nav-logo-word { font-size: 20px !important; letter-spacing: 0.14em !important; }
    .nav-logo-sub { display: none !important; }
  }

  /* ── SHOP ── */
  @media (max-width: 1024px) {
    .shop-layout { grid-template-columns: 200px 1fr !important; gap: 28px !important; }
  }
  @media (max-width: 768px) {
    .shop-mobile-bar-show { display: flex !important; }
    .shop-desktop-sort { display: none !important; }
    .shop-layout { grid-template-columns: 1fr !important; gap: 0 !important; }
    .shop-sidebar { display: none !important; }
  }
  @media (min-width: 769px) {
    .shop-mobile-bar-show { display: none !important; }
  }

  /* ── PRODUCT PAGE ── */
  @media (max-width: 960px) {
    .product-grid { grid-template-columns: 1fr !important; gap: 36px !important; padding-top: 28px !important; }
    .product-gallery { position: static !important; flex-direction: column-reverse !important; gap: 12px !important; }
    .product-thumbcol { flex-direction: row !important; width: 100% !important; overflow-x: auto !important; }
    .product-thumbcol button { width: 64px !important; height: 80px !important; flex-shrink: 0 !important; }
    .related-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 14px !important; }
  }
  @media (max-width: 560px) {
    .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }

  /* ── HOME ── */
  @media (max-width: 640px) {
    .editorial-grid { grid-template-columns: 1fr !important; }
    .ig-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .card-large { grid-column: span 1 !important; }
  }

  /* ── FOOTER RESPONSIVE ── */
  @media (max-width: 900px) {
    .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
  }
  @media (max-width: 560px) {
    .footer-grid { grid-template-columns: 1fr !important; }
    .newsletter-inner { flex-direction: column !important; }
    .newsletter-form { min-width: unset !important; width: 100% !important; }
    .shipping-banner { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
    .shipping-divider-el { display: none !important; }
    .bottom-bar { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
  }
`;

function GlobalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />;
}

function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || a.target === '_blank') return;
      e.preventDefault();
      window.history.pushState({}, '', href);
      setPath(href.split('?')[0]);
      window.scrollTo(0, 0);
    };
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', onClick);
    };
  }, []);
  return path;
}

function renderPage(path: string) {
  if (path === '/admin') return <AdminDashboard />;
  if (path === '/admin/products') return <AdminProducts />;
  if (path.startsWith('/admin/products/')) return <AdminProductEdit productId={path.replace('/admin/products/', '')} />;
  if (path === '/admin/orders') return <AdminOrders />;
  if (path.startsWith('/admin/orders/')) return <AdminOrderDetail orderId={path.replace('/admin/orders/', '')} />;
  if (path === '/admin/customers') return <AdminCustomers />;
  if (path === '/admin/enquiries') return <AdminEnquiries />;
  if (path === '/admin/reviews') return <AdminReviews />;
  if (path === '/admin/shipping') return <AdminShipping />;
  if (path === '/admin/discounts') return <AdminDiscounts />;
  if (path === '/admin/settings') return <AdminSettings />;

  if (path === '/checkout') return <CheckoutPage />;
  if (path === '/shop') return <ShopPage />;
  if (path === '/about') return <AboutPage />;
  if (path === '/contact') return <ContactPage />;
  if (path === '/privacy') return <LegalPage kind="privacy" />;
  if (path === '/terms') return <LegalPage kind="terms" />;
  if (path === '/cookies') return <LegalPage kind="cookies" />;
  if (path.startsWith('/account')) return <AccountPage section={path.replace('/account/', '').replace('/account', '') || 'orders'} />;
  if (path.startsWith('/product/')) {
    const id = path.replace('/product/', '');
    return <ProductPage productId={id} />;
  }
  return <HomePage />;
}

export default function App() {
  const path = useRoute();
  const isAdmin = path.startsWith('/admin');
  return (
    <AuthProvider>
      <CartProvider>
        <GlobalStyles />
        {!isAdmin && <Navbar />}
        {renderPage(path)}
        {!isAdmin && <Footer />}
        <Toast />
        {!isAdmin && <WhatsAppFloat />}
        <AuthModal />
      </CartProvider>
    </AuthProvider>
  );
}
