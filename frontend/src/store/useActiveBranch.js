import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Which branch the vendor console is currently managing.
// Null means "let the backend default to the first branch".
const useActiveBranch = create(
  persist(
    (set) => ({
      branchId: null,
      setBranch: (id) => set({ branchId: id }),
      clear: () => set({ branchId: null }),
    }),
    { name: 'mzaya-active-branch' }
  )
)

export default useActiveBranch
