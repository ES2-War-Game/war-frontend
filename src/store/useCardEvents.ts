import { create } from "zustand";
import type { PlayerCard } from "../types/game"; 

interface CardEventStore {
  refreshTrigger: number;
  triggerRefresh: () => void;
  newCard: PlayerCard | null;
  setNewCard: (card: PlayerCard | null) => void;
}

export const useCardEvents = create<CardEventStore>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((s) => ({ refreshTrigger: s.refreshTrigger + 1 })),
  newCard: null,
  setNewCard: (card) => set({ newCard: card }),
}));