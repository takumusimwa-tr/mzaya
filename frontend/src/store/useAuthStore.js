import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SESSION_KEYS = ['mzaya_token', 'mzaya_user', 'mzaya_auth'];

function persistSession(user, token) {
  localStorage.setItem('mzaya_token', token);
  localStorage.setItem('mzaya_user', JSON.stringify(user));
}

export function clearPersistedSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      setAuth: (user, token) => {
        persistSession(user, token);
        set({ user, token });
      },

      // Used when /auth/me returns refreshed account data or PATCH /auth/me
      // reissues a token after a phone/profile change.
      updateSession: (user, token = get().token) => {
        if (!user || !token) return;
        persistSession(user, token);
        set({ user, token });
      },

      logout: () => {
        clearPersistedSession();

        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.controller?.postMessage('purge-caches');
        }
        if (window.caches) {
          caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
        }

        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token,
      isCustomer:      () => get().user?.role === 'customer',
      isRider:         () => get().user?.role === 'rider',
      isVendor:        () => get().user?.role === 'vendor',
      isAdmin:         () => get().user?.role === 'admin',
    }),
    {
      name: 'mzaya_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'get-token') {
      event.ports?.[0]?.postMessage({ token: useAuthStore.getState().token });
    }
  });
}

export default useAuthStore;
