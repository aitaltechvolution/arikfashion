import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { getSupabase } from '../lib/supabase';
import { dbRowToProduct } from '../hooks/useProducts';
import { Product } from '../types';
import { PRODUCTS } from '../data/products'; // fallback only

// ─── Review type ──────────────────────────────────────────────────────────────
interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

interface ProductPageProps {
  productId: string;
}

export default function ProductPage({ productId }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      // fallback to static
      setProduct(PRODUCTS.find(p => p.id === productId) ?? null);
      return;
    }
    sb.from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          // Try static fallback
          setProduct(PRODUCTS.find(p => p.id === productId) ?? null);
        } else {
          setProduct(dbRowToProduct(data));
        }
      });
  }, [productId]);

  if (product === undefined) {
    return <div style={{ padding: 80, textAlign: 'center', fontFamily: 'serif', color: '#888' }}>Loading…</div>;
  }

  if (!product) {
    return (
      <div style={notFound.wrap}>
        <p style={notFound.code}>404</p>
        <h1 style={notFound.title}>Product not found</h1>
        <a href="/shop" style={notFound.link}>← Back to Shop</a>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}

function ProductDetail({ product: p }: { product: Product }) {
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setRelated(PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 5));
      return;
    }
    sb.from('products')
      .select('*')
      .eq('category', p.category)
      .eq('is_published', true)
      .neq('id', p.id)
      .limit(5)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRelated(data.map(dbRowToProduct));
        } else {
          setRelated(PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 5));
        }
      });
  }, [p.id, p.category]);
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(p.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedLength, setSelectedLength] = useState(p.lengths?.[0] ?? '');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const { user, setIsAuthOpen, setAuthMode } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : '0.0';

  // ── Fetch reviews from Supabase ──────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    const sb = getSupabase();
    if (!sb) {
      setReviewsLoading(false);
      return;
    }
    const { data, error } = await sb
      .from('reviews')
      .select('id, user_name, rating, comment, created_at')
      .eq('product_id', p.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data.map((r: any) => ({
        id: r.id,
        name: r.user_name || 'Anonymous',
        rating: r.rating,
        date: new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        comment: r.comment || '',
      })));
    }
    setReviewsLoading(false);
  }, [p.id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ── Submit review to Supabase ────────────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!reviewComment.trim() || reviewSubmitting) return;
    if (!user) { setAuthMode('login'); setIsAuthOpen(true); return; }

    setReviewSubmitting(true);
    setReviewError('');

    const sb = getSupabase();
    const displayName = user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user.email?.split('@')[0] || 'Anonymous';

    if (sb && !user.id.startsWith('demo-')) {
      const { error } = await sb.from('reviews').insert({
        product_id: p.id,
        user_id: user.id,
        user_name: displayName,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (error) {
        setReviewError('Could not submit review. Please try again.');
        setReviewSubmitting(false);
        return;
      }
      await fetchReviews();
    } else {
      // Demo / no-Supabase fallback: optimistic local insert
      setReviews(prev => [{
        id: Date.now().toString(),
        name: displayName,
        rating: reviewRating,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        comment: reviewComment.trim(),
      }, ...prev]);
    }

    setReviewComment('');
    setReviewRating(5);
    setShowReviewForm(false);
    setReviewSubmitting(false);
  };
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [addedPulse, setAddedPulse] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const effectivePrice = p.onSale && p.salePrice ? p.salePrice : p.price;
  const outOfStock = p.stock === 0;
  const wishlisted = isWishlisted(p.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 1800);
      return;
    }
    addToCart(p, selectedColor, selectedSize, selectedLength || undefined, qty);
    setAddedPulse(true);
    setTimeout(() => setAddedPulse(false), 1400);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <main style={{ background: '#fafafa', minHeight: '80vh' }}>
      {/* Breadcrumb */}
      <div style={s.breadcrumbBar}>
        <div style={s.container}>
          <nav style={s.breadcrumb}>
            <a href="/" style={s.breadcrumbLink}>Home</a>
            <span style={s.breadcrumbSep}>/</span>
            <a href="/shop" style={s.breadcrumbLink}>Shop</a>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>{p.name}</span>
          </nav>
        </div>
      </div>

      <div style={s.container}>
        <div className="product-grid" style={{
          ...s.productGrid,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(20px)',
          transition: 'all 0.55s ease',
        }}>

          {/* LEFT: Image Gallery */}
          <div className="product-gallery" style={s.gallery}>
            <div className="product-thumbcol" style={s.thumbCol}>
              {p.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{ ...s.thumb, ...(activeImg === i ? s.thumbActive : {}) }}
                >
                  <img src={img} alt={`${p.name} view ${i + 1}`} style={s.thumbImg} />
                </button>
              ))}
            </div>

            <div
              ref={imgRef}
              style={{ ...s.mainImgWrap, cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
              onClick={() => setZoomed(v => !v)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomed(false)}
            >
              <img
                src={p.images[activeImg]}
                alt={p.name}
                style={{
                  ...s.mainImg,
                  ...(zoomed ? { transform: 'scale(2)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}),
                }}
              />
              <div style={s.imgBadges}>
                {p.isNew && <span style={s.badgeNew}>New</span>}
                {p.onSale && <span style={s.badgeSale}>Sale</span>}
                {outOfStock && <span style={s.badgeOut}>Sold Out</span>}
              </div>
              {p.images.length > 1 && (
                <>
                  <button
                    style={{ ...s.imgArrow, left: 12 }}
                    onClick={e => { e.stopPropagation(); setActiveImg(i => Math.max(0, i - 1)); }}
                  >‹</button>
                  <button
                    style={{ ...s.imgArrow, right: 12 }}
                    onClick={e => { e.stopPropagation(); setActiveImg(i => Math.min(p.images.length - 1, i + 1)); }}
                  >›</button>
                </>
              )}
              <div style={s.zoomHint}>
                <span style={{ fontSize: 11 }}>⊕</span> <span>Click to zoom</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div style={s.info}>
            <p style={s.categoryTag}>{p.category}</p>
            <h1 style={s.productName}>{p.name}</h1>

            <div style={s.reviewsRow}>
              <div style={s.stars}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: i <= Math.round(parseFloat(avgRating)) ? '#c9a84c' : '#ddd', fontSize: 14 }}>★</span>
                ))}
              </div>
              <span style={s.reviewCount}>{avgRating} · {reviews.length} Review{reviews.length!==1?'s':''}</span>
              <a href="#reviews" style={s.writeReview}>Write a review</a>
            </div>

            <div style={s.availRow}>
              <span style={s.availLabel}>Availability:</span>
              <span style={{ ...s.availStatus, color: outOfStock ? '#c0392b' : '#27ae60' }}>
                {outOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
            </div>

            <div style={s.priceBlock}>
              <span style={p.onSale ? s.priceSale : s.price}>{formatPrice(effectivePrice)}</span>
              {p.onSale && p.salePrice && (
                <>
                  <span style={s.priceOrig}>{formatPrice(p.price)}</span>
                  <span style={s.saveBadge}>Save {Math.round((1 - p.salePrice / p.price) * 100)}%</span>
                </>
              )}
            </div>

            <p style={s.descSnippet}>{p.description}</p>

            <div style={s.divider} />

            {/* Color */}
            <div style={s.selectorBlock}>
              <div style={s.selectorLabel}>
                Color: <strong style={{ color: '#0a0a0a' }}>{selectedColor}</strong>
              </div>
              <div style={s.colorOptions}>
                {p.colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    style={{ ...s.colorBtn, ...(selectedColor === c ? s.colorBtnActive : {}) }}
                  >{c}</button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div style={s.selectorBlock}>
              <div style={s.selectorLabel}>
                Size: {selectedSize && <strong style={{ color: '#0a0a0a' }}>{selectedSize}</strong>}
                {!selectedSize && (
                  <span style={{ color: sizeError ? '#c0392b' : '#aaa', fontSize: 11, transition: 'color 0.3s' }}>
                    {sizeError ? ' — Please select a size!' : ' — Please select'}
                  </span>
                )}
              </div>
              <div style={s.sizeOptions}>
                {p.sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      ...s.sizeBtn,
                      ...(selectedSize === sz ? s.sizeBtnActive : {}),
                      ...(sizeError && !selectedSize ? { borderColor: '#c0392b' } : {}),
                    }}
                  >{sz}</button>
                ))}
              </div>
              <a href="#" style={s.sizeGuide}>Size Guide →</a>
            </div>

            {/* Length */}
            {p.lengths && p.lengths.length > 0 && (
              <div style={s.selectorBlock}>
                <div style={s.selectorLabel}>
                  Length: <strong style={{ color: '#0a0a0a' }}>{selectedLength}</strong>
                </div>
                <div style={s.sizeOptions}>
                  {p.lengths.map(l => (
                    <button
                      key={l}
                      onClick={() => setSelectedLength(l)}
                      style={{ ...s.sizeBtn, ...(selectedLength === l ? s.sizeBtnActive : {}) }}
                    >{l}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={s.divider} />

            {/* Qty + Add to Cart */}
            <div style={s.ctaRow}>
              <div style={s.qtyWrap}>
                <button style={s.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                <span style={s.qtyNum}>{qty}</span>
                <button style={s.qtyBtn} onClick={() => setQty(q => Math.min(p.stock || 10, q + 1))} disabled={qty >= (p.stock || 10) || outOfStock}>+</button>
              </div>
              <button
                style={{
                  ...s.addToCart,
                  ...(outOfStock ? s.addToCartDisabled : {}),
                  ...(addedPulse ? s.addedPulse : {}),
                }}
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                {outOfStock ? 'Out of Stock' : addedPulse ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>

            {addedPulse && <p style={s.inCartNotice}>Item added to your cart!</p>}

            <button
              style={{ ...s.wishlistBtn, ...(wishlisted ? s.wishlistBtnActive : {}) }}
              onClick={() => toggleWishlist(p)}
            >
              <span style={{ fontSize: 16 }}>{wishlisted ? '♥' : '♡'}</span>
              {wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>

            <div style={s.divider} />

            {/* Meta */}
            <div style={s.metaBlock}>
              {[
                ['Categories', p.category],
                ['SKU', `AF-${p.id.padStart(4, '0')}`],
                ['Stock', outOfStock ? 'Unavailable' : `${p.stock} available`],
              ].map(([label, val]) => (
                <div key={label} style={s.metaRow}>
                  <span style={s.metaLabel}>{label}:</span>
                  <span style={s.metaVal}>{val}</span>
                </div>
              ))}
            </div>

            {/* Share */}
            <div style={s.shareRow}>
              <span style={s.shareLabel}>Share:</span>
              <a href={`https://twitter.com/intent/tweet?text=Check out ${p.name} on Aital Fashion!`} target="_blank" rel="noreferrer" style={s.shareBtn} title="Share on X">𝕏</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer" style={s.shareBtn} title="Share on Facebook">f</a>
              <a href={`https://wa.me/2349072297729?text=${encodeURIComponent(p.name + ' - ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noreferrer" style={s.shareBtn} title="Share on WhatsApp">W</a>
            </div>

            {/* Trust badges */}
            <div style={s.trustBadges}>
              {[
                { icon: '🔒', text: 'Secure Checkout' },
                { icon: '🌍', text: 'Ships Worldwide' },
                { icon: '↩️', text: 'Easy Returns' },
              ].map(b => (
                <div key={b.text} style={s.trustBadge}>
                  <span style={{ fontSize: 18 }}>{b.icon}</span>
                  <span style={s.trustText}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabsSection} id="reviews">
          <div style={s.tabBar}>
            {(['description', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                style={{ ...s.tabBtn, ...(activeTab === tab ? s.tabBtnActive : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' ? 'Description' : `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>
          <div style={s.tabContent}>
            {activeTab === 'description' ? (
              <div>
                <p style={s.descPara}>{p.description}</p>
                <p style={s.descPara}>
                  Each Aital Fashion piece is thoughtfully crafted in Lagos, Nigeria, using premium fabrics sourced locally and internationally. Our sizing is true-to-fit — please refer to the size guide before ordering. All pieces are made-to-order, so please allow 7–9 working days for production.
                </p>
                <ul style={s.descList}>
                  <li>Premium quality fabric</li>
                  <li>Handcrafted in Lagos, Nigeria</li>
                  <li>Available in multiple colours and sizes</li>
                  <li>Production timeline: 7–9 working days</li>
                  <li>Dry clean or gentle hand wash recommended</li>
                  <li>Nationwide delivery & international shipping available</li>
                </ul>
              </div>
            ) : (
              <div style={{ padding: '8px 0' }}>

                {/* Loading state */}
                {reviewsLoading && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'24px 0', color:'#aaa', fontFamily:"'Montserrat', sans-serif", fontSize:11, letterSpacing:'0.1em' }}>
                    <div style={{ width:16, height:16, border:'2px solid #ede5dc', borderTopColor:'#c9a96e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                    Loading reviews…
                  </div>
                )}

                {/* Write review prompt */}
                {!reviewsLoading && !showReviewForm && (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: reviews.length > 0 ? 24 : 0, flexWrap:'wrap', gap:12 }}>
                    {reviews.length === 0 && (
                      <p style={s.noReviewsText}>No reviews yet. Be the first to share your experience.</p>
                    )}
                    {reviews.length > 0 && (
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:32, fontWeight:500 }}>{avgRating}</span>
                        <div>
                          <div style={{ display:'flex', gap:2, marginBottom:3 }}>
                            {[1,2,3,4,5].map(s2 => (
                              <svg key={s2} width="14" height="14" viewBox="0 0 24 24" fill={parseFloat(avgRating)>=s2?"#c9a96e":"none"} stroke="#c9a96e" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            ))}
                          </div>
                          <div style={{ fontFamily:"'Montserrat', sans-serif", fontSize:9, color:'#8a7e76', letterSpacing:'0.1em' }}>{reviews.length} review{reviews.length!==1?'s':''}</div>
                        </div>
                      </div>
                    )}
                    <button
                      style={s.writeReviewBtn}
                      onClick={() => {
                        if (!user) { setAuthMode('login'); setIsAuthOpen(true); }
                        else setShowReviewForm(true);
                      }}
                    >
                      {user ? 'Write a Review' : 'Sign in to Review'}
                    </button>
                  </div>
                )}

                {/* Review form */}
                {!reviewsLoading && showReviewForm && (
                  <div style={{ background:'#fff', border:'1px solid #ede5dc', padding:'24px', marginBottom:24, animation:'fadeUp 0.2s ease' }}>
                    <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, marginBottom:16 }}>Your Review</div>
                    {/* Star selector */}
                    <div style={{ display:'flex', gap:6, marginBottom:14 }}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setReviewRating(n)} style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill={reviewRating>=n?"#c9a96e":"none"} stroke="#c9a96e" strokeWidth="1.5" style={{transition:'fill 0.1s'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </button>
                      ))}
                      <span style={{ fontFamily:"'Montserrat', sans-serif", fontSize:10, color:'#8a7e76', alignSelf:'center', marginLeft:6 }}>
                        {['','Poor','Fair','Good','Very Good','Excellent'][reviewRating]}
                      </span>
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this piece…"
                      rows={4}
                      style={{ width:'100%', padding:'12px 14px', border:'1px solid #d4c9c0', background:'#faf8f5', fontFamily:"'Montserrat', sans-serif", fontSize:12, color:'#1a1a1a', outline:'none', resize:'vertical', lineHeight:1.6, marginBottom: reviewError ? 8 : 14 }}
                    />
                    {reviewError && (
                      <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:10, color:'#c0392b', letterSpacing:'0.06em', marginBottom:12 }}>{reviewError}</p>
                    )}
                    <div style={{ display:'flex', gap:10 }}>
                      <button
                        onClick={handleSubmitReview}
                        disabled={!reviewComment.trim() || reviewSubmitting}
                        style={{ background:'#1a1a1a', color:'#fafafa', border:'none', padding:'12px 28px', fontFamily:"'Montserrat', sans-serif", fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', fontWeight:700, cursor:reviewComment.trim() && !reviewSubmitting ? 'pointer':'not-allowed', opacity:(!reviewComment.trim()||reviewSubmitting)?0.5:1 }}
                      >
                        {reviewSubmitting ? 'Posting…' : 'Submit Review'}
                      </button>
                      <button onClick={() => { setShowReviewForm(false); setReviewError(''); }} style={{ background:'none', border:'1px solid #d4c9c0', padding:'12px 20px', fontFamily:"'Montserrat', sans-serif", fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer', color:'#8a7e76' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews list */}
                {!reviewsLoading && reviews.map(review => (
                  <div key={review.id} style={{ borderBottom:'1px solid #ede5dc', padding:'20px 0' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div>
                        <div style={{ fontFamily:"'Montserrat', sans-serif", fontSize:12, fontWeight:700, color:'#1a1a1a', marginBottom:4 }}>{review.name}</div>
                        <div style={{ display:'flex', gap:2 }}>
                          {[1,2,3,4,5].map(n => (
                            <svg key={n} width="12" height="12" viewBox="0 0 24 24" fill={review.rating>=n?"#c9a96e":"none"} stroke="#c9a96e" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          ))}
                        </div>
                      </div>
                      <span style={{ fontFamily:"'Montserrat', sans-serif", fontSize:9, color:'#b0a49a', letterSpacing:'0.08em' }}>{review.date}</span>
                    </div>
                    <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:12, color:'#5a5a5a', lineHeight:1.7 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={s.relatedSection}>
            <h2 style={s.relatedTitle}>You May Also Like…</h2>
            <div className="related-grid" style={s.relatedGrid}>
              {related.map(rp => <RelatedCard key={rp.id} product={rp} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function RelatedCard({ product: p }: { product: Product }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={`/product/${p.id}`}
      style={s.relCard}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={s.relImgWrap}>
        <img
          src={p.images[0]}
          alt={p.name}
          style={{ ...s.relImg, transform: hov ? 'scale(1.06)' : 'scale(1)' }}
        />
        {p.onSale && <span style={s.relBadge}>Sale</span>}
        {p.isNew && !p.onSale && <span style={{ ...s.relBadge, background: '#0a0a0a' }}>New</span>}
      </div>
      <div style={s.relInfo}>
        <p style={s.relCat}>{p.category}</p>
        <p style={s.relName}>{p.name}</p>
        <div style={s.relPriceRow}>
          <span style={p.onSale ? s.relPriceSale : s.relPrice}>
            {formatPrice(p.onSale && p.salePrice ? p.salePrice : p.price)}
          </span>
          {p.onSale && p.salePrice && <span style={s.relPriceOrig}>{formatPrice(p.price)}</span>}
        </div>
      </div>
    </a>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)' },
  breadcrumbBar: { background: '#f5f5f5', borderBottom: '1px solid #ebebeb', padding: '10px 0' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' },
  breadcrumbLink: { textDecoration: 'none', color: '#444' },
  breadcrumbSep: { color: '#ccc' },
  breadcrumbCurrent: { color: '#0a0a0a', fontWeight: 600 },
  productGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, paddingTop: 40, paddingBottom: 60, alignItems: 'start' },
  gallery: { display: 'flex', gap: 16, alignItems: 'flex-start', position: 'sticky', top: 90 },
  thumbCol: { display: 'flex', flexDirection: 'column', gap: 10, width: 80, flexShrink: 0 },
  thumb: { width: 80, height: 96, border: '2px solid transparent', padding: 0, background: 'none', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.18s' },
  thumbActive: { borderColor: '#0a0a0a' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  mainImgWrap: { flex: 1, position: 'relative', overflow: 'hidden', background: '#f5f5f5', aspectRatio: '3/4' },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.1s ease-out' },
  imgBadges: { position: 'absolute', top: 14, left: 14, display: 'flex', flexDirection: 'column', gap: 5 },
  badgeNew: { fontSize: 8, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.18em', textTransform: 'uppercase', background: '#0a0a0a', color: '#fff', padding: '3px 8px' },
  badgeSale: { fontSize: 8, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.18em', textTransform: 'uppercase', background: '#c0392b', color: '#fff', padding: '3px 8px' },
  badgeOut: { fontSize: 8, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.18em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.9)', color: '#444', padding: '3px 8px' },
  imgArrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0a0a0a', zIndex: 2, fontSize: 22, fontWeight: 300 },
  zoomHint: { position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.85)', padding: '4px 8px', fontSize: 9, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.08em', color: '#666', pointerEvents: 'none' },
  info: { paddingTop: 8 },
  categoryTag: { fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2a2a2a', marginBottom: 10 },
  productName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 400, letterSpacing: '0.04em', color: '#0a0a0a', lineHeight: 1.1, marginBottom: 14 },
  reviewsRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  stars: { display: 'flex', gap: 1 },
  reviewCount: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#444', letterSpacing: '0.06em' },
  writeReview: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#0a0a0a', letterSpacing: '0.08em', textDecoration: 'underline' },
  availRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: '0.06em' },
  availLabel: { color: '#444' },
  availStatus: { fontWeight: 600 },
  priceBlock: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 },
  price: { fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 400, color: '#0a0a0a', letterSpacing: '0.02em' },
  priceSale: { fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 400, color: '#c0392b', letterSpacing: '0.02em' },
  priceOrig: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#888', textDecoration: 'line-through' },
  saveBadge: { fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', background: '#c0392b', color: '#fff', padding: '3px 8px' },
  descSnippet: { fontFamily: "'Montserrat', sans-serif", fontSize: 12, lineHeight: 1.8, color: '#2a2a2a', letterSpacing: '0.04em', marginBottom: 20 },
  divider: { height: 1, background: '#f0f0f0', margin: '18px 0' },
  selectorBlock: { marginBottom: 20 },
  selectorLabel: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#444', marginBottom: 10 },
  colorOptions: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  colorBtn: { border: '1.5px solid #ddd', background: 'none', padding: '7px 14px', fontSize: 10, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.1em', cursor: 'pointer', color: '#2a2a2a', transition: 'all 0.15s' },
  colorBtnActive: { border: '1.5px solid #0a0a0a', color: '#0a0a0a', fontWeight: 600, background: '#f5f5f5' },
  sizeOptions: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  sizeBtn: { width: 44, height: 44, border: '1.5px solid #ddd', background: 'none', fontSize: 11, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.06em', cursor: 'pointer', color: '#2a2a2a', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sizeBtnActive: { border: '1.5px solid #0a0a0a', background: '#0a0a0a', color: '#fafafa' },
  sizeGuide: { fontFamily: "'Montserrat', sans-serif", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', textDecoration: 'underline' },
  ctaRow: { display: 'flex', gap: 12, alignItems: 'stretch', marginBottom: 14 },
  qtyWrap: { display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', height: 52 },
  qtyBtn: { width: 40, height: '100%', border: 'none', background: 'none', fontSize: 20, color: '#0a0a0a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { width: 36, textAlign: 'center', fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 600, borderLeft: '1px solid #eee', borderRight: '1px solid #eee', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  addToCart: { flex: 1, background: '#0a0a0a', color: '#fafafa', border: 'none', height: 52, fontSize: 11, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s', fontWeight: 600 },
  addToCartDisabled: { background: '#ccc', cursor: 'not-allowed' },
  addedPulse: { background: '#27ae60' },
  inCartNotice: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.1em', color: '#27ae60', marginBottom: 12 },
  wishlistBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px solid #ddd', padding: '10px 20px', fontSize: 10, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', color: '#2a2a2a', transition: 'all 0.18s', width: '100%', justifyContent: 'center', marginBottom: 0 },
  wishlistBtnActive: { border: '1.5px solid #c0392b', color: '#c0392b' },
  metaBlock: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
  metaRow: { display: 'flex', gap: 8, fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.08em' },
  metaLabel: { color: '#2a2a2a', minWidth: 80 },
  metaVal: { color: '#444' },
  shareRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 },
  shareLabel: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555' },
  shareBtn: { width: 34, height: 34, border: '1.5px solid #eee', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'serif' },
  trustBadges: { display: 'flex', gap: 0, borderTop: '1px solid #f0f0f0', paddingTop: 16 },
  trustBadge: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '0 8px', borderRight: '1px solid #f0f0f0' },
  trustText: { fontFamily: "'Montserrat', sans-serif", fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444', textAlign: 'center' },
  tabsSection: { borderTop: '1px solid #f0f0f0', paddingBottom: 60 },
  tabBar: { display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: 32 },
  tabBtn: { padding: '16px 32px', border: 'none', background: 'none', fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2a2a2a', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1, transition: 'all 0.18s' },
  tabBtnActive: { color: '#0a0a0a', borderBottomColor: '#0a0a0a', fontWeight: 700 },
  tabContent: { maxWidth: 760 },
  descPara: { fontFamily: "'Montserrat', sans-serif", fontSize: 12, lineHeight: 1.9, color: '#2a2a2a', letterSpacing: '0.04em', marginBottom: 16 },
  descList: { fontFamily: "'Montserrat', sans-serif", fontSize: 12, lineHeight: 2, color: '#2a2a2a', letterSpacing: '0.04em', paddingLeft: 20 },
  reviewsContent: { textAlign: 'center', padding: '40px 0' },
  noReviewsText: { fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: '#2a2a2a', marginBottom: 20, letterSpacing: '0.06em' },
  writeReviewBtn: { background: '#0a0a0a', color: '#fafafa', border: 'none', padding: '11px 28px', fontSize: 10, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' },
  relatedSection: { paddingBottom: 80 },
  relatedTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, letterSpacing: '0.06em', color: '#0a0a0a', marginBottom: 32 },
  relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 },
  relCard: { textDecoration: 'none', color: 'inherit', display: 'block' },
  relImgWrap: { position: 'relative', overflow: 'hidden', paddingBottom: '125%', background: '#f5f5f5', marginBottom: 12 },
  relImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' },
  relBadge: { position: 'absolute', top: 8, left: 8, fontSize: 7, fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.14em', textTransform: 'uppercase', background: '#c0392b', color: '#fff', padding: '2px 6px' },
  relInfo: { paddingBottom: 4 },
  relCat: { fontFamily: "'Montserrat', sans-serif", fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2a2a2a', marginBottom: 3 },
  relName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 400, color: '#0a0a0a', marginBottom: 4 },
  relPriceRow: { display: 'flex', alignItems: 'center', gap: 6 },
  relPrice: { fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 500, color: '#0a0a0a' },
  relPriceSale: { fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 600, color: '#c0392b' },
  relPriceOrig: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: '#888', textDecoration: 'line-through' },
};

const notFound: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  code: { fontFamily: "'Cormorant Garamond', serif", fontSize: 80, color: '#ddd', lineHeight: 1 },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#0a0a0a' },
  link: { fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0a0a0a', textDecoration: 'underline' },
};
