import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameStatus } from "../types/lobby";

interface GameStore {

  gameId:number| null;
  setGameId: (gameId: number | null) => void;
  // map: territoryNameNormalized -> { color, id, ownerId }
  territoriesColors: Record<
    string,
    { color: string; id: number; ownerId: number | null }
  >;
  setTerritoriesColors: (
    map: Record<string, { color: string; id: number; ownerId: number | null }>
  ) => void;

  playerObjective: Record<string, string>; 
  setPlayerObjective: (payload: { id: number; objective: string }) => void;

  player: PlayerGameDto | null;
  setPlayer: (player: PlayerGameDto | null) => void;

  turnPlayer: number | null;
  setTurnPlayer: (playerId: number | null) => void;

  gameStatus:GameStatus| null;
  setGameStatus: (status: GameStatus ) => void;

  clearGameState: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameId:null,
      setGameId: (gameId)=> set({gameId:gameId}),

      territoriesColors: {},
      setTerritoriesColors: (map) => set({ territoriesColors: map }),

      playerObjective: {},
      setPlayerObjective: (payload) =>
        set((s) => ({
          playerObjective: {
            ...s.playerObjective,
            [payload.id]: payload.objective,
          },
        })),
      turnPlayer: null,
      setTurnPlayer: (player) => set({ turnPlayer:player }),

      player: null,
      setPlayer: (player) => set({ player }),

      gameStatus: null,
      setGameStatus: (status:GameStatus) => set({ gameStatus:status }),

      clearGameState: () =>
        set({ territoriesColors: {}, playerObjective: {}, player: null }),
    }),
    {
      name: "game-store", // localStorage key
      partialize: (state) => ({
        territoriesColors: state.territoriesColors,
        playerObjective: state.playerObjective,
        player: state.player,
        turnPlayer:state.turnPlayer,
        gameStatus:state.gameStatus,
        gameId:state.gameId

      }),
    }
  )
);
