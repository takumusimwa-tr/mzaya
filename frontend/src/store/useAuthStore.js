import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      setAuth: (user, token) => {
        localStorage.setItem('mzaya_token', token);
        localStorage.setItem('mzaya_user', JSON.stringify(user));
        set({ user, token });
      },

      logout: () => {
        localStorage.removeItem('mzaya_token');
        localStorage.removeItem('mzaya_user');

        // Destroy every service-worker cache on the way out.
        //
        // Cache Storage outlives a session. Phones are routinely shared in
        // Zimbabwe, so without this the next person to sign in on this handset
        // could be served the previous user's cached data. The service worker no
        // longer caches private API responses at all, but images and any public
        // data still land on disk — and belt-and-braces is the right posture for
        // anything touching another person's account.
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

// The service worker never stores a token. When it needs to replay a queued
// command it asks the live app for one through this channel.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'get-token') {
      event.ports?.[0]?.postMessage({ token: useAuthStore.getState().token });
    }
  });
}

export default useAuthStore;
