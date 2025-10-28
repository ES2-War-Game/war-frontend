
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AllocateStore {
  allocating:boolean
  unallocatedArmies:number;
  setAllocating: (status:boolean) => void;
  // allocate: remove N from unallocatedArmies (default 1)
  setAllocate: (amount?: number) => void;
  // desallocate: add N to unallocatedArmies (default 1)
  setDesallocate: (amount?: number) => void;

  setUnallocatedArmies: (amount: number) => void;
  
}

export const useAllocateStore = create<AllocateStore>()(
  persist(
    (set) => ({
      allocating: false,
      unallocatedArmies: 0,
      setAllocating: (status) => set(() => ({ allocating: status })),
      // remove `amount` armies from unallocated (default 1). never go below 0
      setAllocate: (amount = 1) =>
        set((s) => ({ unallocatedArmies: Math.max(0, s.unallocatedArmies - Math.max(1, amount)) })),

      // add `amount` armies back to unallocated (default 1)
      setDesallocate: (amount = 1) =>
        set((s) => ({ unallocatedArmies: s.unallocatedArmies + Math.max(1, amount) })),

      
  setUnallocatedArmies: (status: number) => set(() => ({ unallocatedArmies: status })),
    }),
    {
      name: "allocate-store",
      partialize: (state) => ({ allocating: state.allocating, unallocatedArmies: state.unallocatedArmies }),
    }
  )
);