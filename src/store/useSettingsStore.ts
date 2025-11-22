import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  musicEnabled: boolean;
  diceAnimationEnabled: boolean;
  
  setMusicEnabled: (enabled: boolean) => void;
  setDiceAnimationEnabled: (enabled: boolean) => void;
  toggleMusic: () => void;
  toggleDiceAnimation: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      musicEnabled: true,
      diceAnimationEnabled: true,
      
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setDiceAnimationEnabled: (enabled) => set({ diceAnimationEnabled: enabled }),
      
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
      toggleDiceAnimation: () => set((state) => ({ diceAnimationEnabled: !state.diceAnimationEnabled })),
    }),
    {
      name: "settings-store",
    }
  )
);
