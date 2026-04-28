import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { PartnerRole } from '../lib/api';
import * as api from '../lib/api';

const IDLE_MS = 30 * 60 * 1000;
const IDLE_CHECK_MS = 60 * 1000;

export interface Partner {
  id: string;
  email: string;
  name: string;
  role: PartnerRole;
  allowedFeatures: string[];
}

interface AuthContextValue {
  partner: Partner | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  canAccess: (feature: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistPartner(p: Partner) {
  localStorage.setItem(api.PARTNER_KEY, JSON.stringify(p));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(api.TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);
  const lastActivityRef = useRef<number>(Date.now());

  const logout = useCallback(() => {
    setToken(null);
    setPartner(null);
    api.logout();
  }, []);

  const bumpActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const storedToken = localStorage.getItem(api.TOKEN_KEY);

    (async () => {
      if (storedToken) {
        const me = await api.fetchCurrentPartner();
        if (!cancelled && me) {
          const next: Partner = {
            id: me.id,
            email: me.email,
            name: me.name,
            role: me.role,
            allowedFeatures: me.allowedFeatures,
          };
          setPartner(next);
          persistPartner(next);
          bumpActivity();
        } else if (!cancelled && storedToken) {
          const stored = localStorage.getItem(api.PARTNER_KEY);
          if (stored) {
            try {
              const p = JSON.parse(stored) as Partner;
              if (p?.id && p?.email && Array.isArray(p.allowedFeatures) && p.role) {
                setPartner(p);
                bumpActivity();
              } else {
                localStorage.removeItem(api.PARTNER_KEY);
              }
            } catch {
              localStorage.removeItem(api.PARTNER_KEY);
            }
          }
        }
      } else {
        const stored = localStorage.getItem(api.PARTNER_KEY);
        if (stored) {
          try {
            const p = JSON.parse(stored) as Partner;
            if (p?.id && p?.email && Array.isArray(p.allowedFeatures) && p.role) {
              if (!cancelled) setPartner(p);
            } else {
              localStorage.removeItem(api.PARTNER_KEY);
            }
          } catch {
            localStorage.removeItem(api.PARTNER_KEY);
          }
        }
      }
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [bumpActivity]);

  useEffect(() => {
    if (!token) return;
    const onActivity = () => bumpActivity();
    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    const interval = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current >= IDLE_MS) {
        logout();
      }
    }, IDLE_CHECK_MS);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.clearInterval(interval);
    };
  }, [token, logout, bumpActivity]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    const next: Partner = {
      id: res.partner.id,
      email: res.partner.email,
      name: res.partner.name,
      role: res.partner.role,
      allowedFeatures: res.partner.allowedFeatures,
    };
    setPartner(next);
    localStorage.setItem(api.TOKEN_KEY, res.token);
    persistPartner(next);
    bumpActivity();
  };

  const isAdmin = partner?.role === 'admin';
  const canAccess = (feature: string) => partner?.allowedFeatures?.includes(feature) ?? false;

  return (
    <AuthContext.Provider
      value={{
        partner,
        token,
        isAuthenticated: !!token,
        isLoading,
        isAdmin,
        canAccess,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
