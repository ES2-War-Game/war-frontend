import {create} from "zustand";
import { persist } from "zustand/middleware";

interface GameStore {
  territoriesColors: Record<string, { color: string; id: number }>;
  setTerritoriesColors: (map: Record<string, { color: string; id: number }>) => void;

  playerObjectives: Record<string, string>; // playerId -> objective
  setPlayerObjective: (playerId: string, objective: string) => void;
  setPlayerObjectives: (map: Record<string, string>) => void;

  players: PlayerGameDto[];
  setPlayers: (players: PlayerGameDto[]) => void;

  clearGameState: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      territoriesColors: {},
      setTerritoriesColors: (map) => set({ territoriesColors: map }),

      playerObjectives: {},
      setPlayerObjective: (playerId, objective) =>
        set((s) => ({ playerObjectives: { ...s.playerObjectives, [playerId]: objective } })),
      setPlayerObjectives: (map) => set({ playerObjectives: map }),

      players: [],
      setPlayers: (players) => set({ players }),

      clearGameState: () =>
        set({ territoriesColors: {}, playerObjectives: {}, players: [] }),
    }),
    {
      name: "game-store", // localStorage key
      partialize: (state) => ({
        territoriesColors: state.territoriesColors,
        playerObjectives: state.playerObjectives,
        players: state.players,
      }),
    }
  )
);