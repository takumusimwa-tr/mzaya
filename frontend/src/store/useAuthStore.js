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

export default useAuthStore;
