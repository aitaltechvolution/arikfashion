import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getSupabase } from '../lib/supabase';

// ─── Supabase client ──────────────────────────────────────────────────────────
// Uses the shared singleton from src/lib/supabase.ts (sync — returns SupabaseClient | null)

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  // Saved purchase / shipping details — optional, can be auto-filled at checkout
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  color: string;
  size: string;
  length?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus?: string;
  note?: string;
  address: {
    firstName: string; lastName: string; phone: string; email: string;
    address: string; city: string; state: string; country: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  roleLoading: boolean;
  isAdmin: boolean;
  orders: Order[];
  // Modal control
  isAuthOpen: boolean;
  setIsAuthOpen: (v: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (m: 'login' | 'signup') => void;
  // Password-based actions
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    details?: Partial<UserProfile>,
  ) => Promise<{ error: string | null; needsConfirm?: boolean }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<{ orderId: string | null; error: string | null }>;
  fetchOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── DEMO store (used when Supabase is not configured) ─────────────────────
let demoOrders: Order[] = [];
const demoProfiles = new Map<string, { password: string; profile: UserProfile }>();

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // Re-check admin role + load profile fields whenever the user changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user || user.id.startsWith('demo-')) {
        setIsAdmin(false);
        setRoleLoading(false);
        return;
      }
      setRoleLoading(true);
      try {
        const sb = getSupabase();
        if (!sb) { setIsAdmin(false); setRoleLoading(false); return; }

        const { data, error } = await sb
          .from('profiles')
          .select('role, first_name, last_name, phone, address, city, state, country, zip')
          .eq('id', user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.warn('[Auth] profiles fetch error (500?):', error.message);
          // Don't crash — just leave isAdmin false and unblock the UI
          setIsAdmin(false);
          setRoleLoading(false);
          return;
        }

        console.log('[Auth] profile role for', user.email, '→', data?.role ?? 'no row');
        setIsAdmin(data?.role === 'admin');
        setRoleLoading(false);

        if (data) {
          const d = data; // stable reference for the closure
          setUser(prev => prev ? {
            ...prev,
            firstName: d.first_name ?? prev.firstName,
            lastName: d.last_name ?? prev.lastName,
            phone: d.phone ?? prev.phone,
            address: d.address ?? prev.address,
            city: d.city ?? prev.city,
            state: d.state ?? prev.state,
            country: d.country ?? prev.country,
            zip: d.zip ?? prev.zip,
          } : prev);
        }
      } catch (err) {
        console.warn('[Auth] unexpected error in role fetch:', err);
        if (!cancelled) { setIsAdmin(false); setRoleLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const mapUser = (u: any): UserProfile => ({
    id: u.id,
    email: u.email ?? u.user_metadata?.email ?? '',
    firstName: u.user_metadata?.first_name,
    lastName: u.user_metadata?.last_name,
    phone: u.user_metadata?.phone,
    address: u.user_metadata?.address,
    city: u.user_metadata?.city,
    state: u.user_metadata?.state,
    country: u.user_metadata?.country,
    zip: u.user_metadata?.zip,
    avatarUrl: u.user_metadata?.avatar_url,
    createdAt: u.created_at,
  });

  // Bootstrap session
  useEffect(() => {
    let unsub: (() => void) | null = null;
    const sb = getSupabase();
    if (!sb) { setLoading(false); setRoleLoading(false); return; }

    sb.auth.getSession().then(({ data }: any) => {
      if (data?.session?.user) {
        setUser(mapUser(data.session.user));
      } else {
        setRoleLoading(false);
      }
      setLoading(false);
    });

    const { data: listener } = sb.auth.onAuthStateChange((_: any, session: any) => {
      if (session?.user) {
        setRoleLoading(true);
        setUser(mapUser(session.user));
      } else {
        setIsAdmin(false);
        setRoleLoading(false);
        setUser(null);
      }
    });
    unsub = () => listener?.subscription?.unsubscribe?.();

    return () => { unsub?.(); };
  }, []);

  // ── signIn (email + password) ────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) {
      // Demo mode
      const rec = demoProfiles.get(email.toLowerCase());
      if (!rec || rec.password !== password) return { error: 'Invalid email or password' };
      setUser(rec.profile);
      return { error: null };
    }
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  }, []);

  // ── signUp (email + password + optional purchase details) ────────────────
  const signUp = useCallback(async (email: string, password: string, details: Partial<UserProfile> = {}) => {
    const sb = getSupabase();
    if (!sb) {
      // Demo mode
      const key = email.toLowerCase();
      if (demoProfiles.has(key)) return { error: 'An account with that email already exists' };
      const profile: UserProfile = { id: 'demo-' + Date.now(), email, ...details };
      demoProfiles.set(key, { password, profile });
      setUser(profile);
      return { error: null };
    }

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: details.firstName,
          last_name: details.lastName,
          phone: details.phone,
          address: details.address,
          city: details.city,
          state: details.state,
          country: details.country,
          zip: details.zip,
        },
      },
    });

    if (error) {
      // Surface friendly messages for common Supabase errors
      const msg = error.message ?? '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }
      if (msg.toLowerCase().includes('password')) {
        return { error: 'Password must be at least 6 characters.' };
      }
      return { error: msg || 'Could not create account. Please try again.' };
    }

    // If a session was returned (email confirmation disabled in Supabase),
    // upsert the profile row immediately. The on_auth_user_created trigger
    // handles the case when confirmation IS enabled.
    if (data?.session?.user) {
      try {
        const { error: upsertErr } = await sb.from('profiles').upsert({
          id: data.session.user.id,
          email,
          first_name: details.firstName ?? null,
          last_name: details.lastName ?? null,
          phone: details.phone ?? null,
          address: details.address ?? null,
          city: details.city ?? null,
          state: details.state ?? null,
          country: details.country ?? null,
          zip: details.zip ?? null,
          role: 'customer',
        }, { onConflict: 'id' });
        if (upsertErr) {
          // RLS may block anon insert — not fatal, trigger will create the row
          console.warn('[Auth] profile upsert skipped (trigger will handle):', upsertErr.message);
        }
      } catch (e) {
        console.warn('[Auth] profile upsert exception:', e);
      }
    }

    return { error: null, needsConfirm: !data?.session };
  }, []);

  // ── updateProfile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    const sb = getSupabase();
    if (!sb) {
      setUser(prev => prev ? { ...prev, ...data } : null);
      return { error: null };
    }
    if (!user) return { error: 'Not signed in' };

    // Update auth metadata
    const { error: authErr } = await sb.auth.updateUser({
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zip: data.zip,
      },
    });
    if (authErr) return { error: authErr.message };

    // Mirror into the public profiles table so checkout can read it
    const { error: rowErr } = await sb.from('profiles').upsert({
      id: user.id,
      email: user.email,
      first_name: data.firstName ?? user.firstName ?? null,
      last_name: data.lastName ?? user.lastName ?? null,
      phone: data.phone ?? user.phone ?? null,
      address: data.address ?? user.address ?? null,
      city: data.city ?? user.city ?? null,
      state: data.state ?? user.state ?? null,
      country: data.country ?? user.country ?? null,
      zip: data.zip ?? user.zip ?? null,
    }, { onConflict: 'id' });
    if (rowErr) return { error: rowErr.message };

    setUser(prev => prev ? { ...prev, ...data } : null);
    return { error: null };
  }, [user]);

  // ── signOut ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setUser(null);
    setOrders([]);
  }, []);

  // ── placeOrder ───────────────────────────────────────────────────────────
  const placeOrder = useCallback(async (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const sb = getSupabase();
    const newOrder: Order = {
      ...order,
      id: 'ORD-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    if (!sb || !user || user.id.startsWith('demo-')) {
      demoOrders = [newOrder, ...demoOrders];
      setOrders([...demoOrders]);
      return { orderId: newOrder.id, error: null };
    }

    const { data, error } = await sb.from('orders').insert({
      user_id: user.id,
      customer_email: user.email,
      status: 'pending',
      items: order.items,
      subtotal: order.total - (order.shippingCost ?? 0) + (order.discount ?? 0),
      shipping_cost: order.shippingCost ?? 0,
      discount: order.discount ?? 0,
      total: order.total,
      shipping_method: order.shippingMethod,
      payment_method: order.paymentMethod,
      payment_status: 'pending',
      address: order.address,
      note: order.note ?? null,
    }).select('id').single();

    if (error) return { orderId: null, error: error.message };
    await fetchOrders();
    return { orderId: data.id, error: null };
  }, [user]);

  // ── fetchOrders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !user || user.id.startsWith('demo-')) {
      setOrders([...demoOrders]);
      return;
    }
    const { data } = await sb
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setOrders(data.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        createdAt: o.created_at,
        status: o.status,
        items: o.items,
        subtotal: o.subtotal ?? o.total,
        shippingCost: o.shipping_cost ?? 0,
        discount: o.discount ?? 0,
        total: o.total,
        shippingMethod: o.shipping_method,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        note: o.note,
        address: o.address,
      })));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading, roleLoading, isAdmin, orders,
      isAuthOpen, setIsAuthOpen,
      authMode, setAuthMode,
      signIn, signUp, updateProfile, signOut,
      placeOrder, fetchOrders,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
