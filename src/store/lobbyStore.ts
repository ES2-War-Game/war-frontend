import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Player } from "../types/lobby";

interface LobbyStore {
  currentLobbyId: number | null;
  currentLobbyPlayers: Player[];
  setCurrentLobbyId: (id: number | null) => void;
  setCurrentLobbyPlayers: (players: Player[]) => void;
  clearLobby: () => void;
}

export const useLobbyStore = create<LobbyStore>()(
  persist(
    (set) => ({
      currentLobbyId: null,
      currentLobbyPlayers: [],
      setCurrentLobbyId: (id: number | null) => set({ currentLobbyId: id }),
      setCurrentLobbyPlayers: (players: Player[]) => set({ currentLobbyPlayers: players }),
      clearLobby: () => set({ currentLobbyId: null, currentLobbyPlayers: [] }),
    }),
    {
      name: "lobby-store",
      partialize: (state) => ({
        currentLobbyId: state.currentLobbyId,
        currentLobbyPlayers: state.currentLobbyPlayers,
      }),
    }
  )
);