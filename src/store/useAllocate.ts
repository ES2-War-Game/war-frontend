
import {create} from "zustand";

interface AllocateStore {
  allocating:boolean
  setAllocating: (status:boolean) => void;
  
}

export const useAllocateStore = create<AllocateStore>((set) => ({
  allocating: false,
  setAllocating: (status) => set(() => ({ allocating: status })),
}));