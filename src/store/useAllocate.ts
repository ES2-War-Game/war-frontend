
import {create} from "zustand";

interface AllocateStore {
  allocating:boolean
  unallocatedArmies:number;
  setAllocating: (status:boolean) => void;
  // allocate: remove N from unallocatedArmies (default 1)
  setAllocate: (amount?: number) => void;
  // desallocate: add N to unallocatedArmies (default 1)
  setDesallocate: (amount?: number) => void;

  setUnalocatedArmies: (amount:number) =>void;
  
}

export const useAllocateStore = create<AllocateStore>((set) => ({
  allocating: false,
  unallocatedArmies:0,
  setAllocating: (status) => set(() => ({ allocating: status })),
  // remove `amount` armies from unallocated (default 1). never go below 0
  setAllocate: (amount = 1) =>
    set((s) => ({ unallocatedArmies: Math.max(0, s.unallocatedArmies - Math.max(1, amount)) })),

  // add `amount` armies back to unallocated (default 1)
  setDesallocate: (amount = 1) =>
    set((s) => ({ unallocatedArmies: s.unallocatedArmies + Math.max(1, amount) })),

   setUnalocatedArmies:(status) => set(() => ({ unallocatedArmies: status })),
}));