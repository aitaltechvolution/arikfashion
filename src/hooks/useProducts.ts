import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { Product } from '../types';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';

// Map a Supabase row → Product type used throughout the site
export function dbRowToProduct(row: any): Product {
  return {
    id: String(row.id),
    name: row.name,
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    images: Array.isArray(row.images) ? row.images : (row.images ? [row.images] : []),
    category: row.category || '',
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    lengths: Array.isArray(row.lengths) ? row.lengths : undefined,
    stock: Number(row.stock) || 0,
    description: row.description || '',
    isNew: !!row.is_new,
    isFeatured: !!row.is_featured,
    onSale: !!row.on_sale,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      // No Supabase configured — fall back to static seed data
      setProducts(STATIC_PRODUCTS);
      setLoading(false);
      return;
    }

    sb.from('products')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          // Table empty or error — fall back to static data
          setProducts(STATIC_PRODUCTS);
        } else {
          setProducts(data.map(dbRowToProduct));
        }
        setLoading(false);
      });
  }, []);

  return { products, loading };
}
