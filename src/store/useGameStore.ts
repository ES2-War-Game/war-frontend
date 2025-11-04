import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameStatus, PlayerGame } from "../types/lobby";
import type { gameHUD } from "../types/game";
import type { TerritoryInfo } from "../utils/gameState";

interface PlayerObjectiveMap {
  [playerId: string]: string;
}

interface GameStore {
  gameId: number | null;
  setGameId: (gameId: number | null) => void;

  territoriesColors: Record<string, TerritoryInfo>;
  setTerritoriesColors: (map: Record<string, TerritoryInfo>) => void;

  playerObjective: PlayerObjectiveMap;
  setPlayerObjective: (payload: { id: number; objective: string }) => void;

  player: PlayerGameDto | null;
  setPlayer: (player: PlayerGameDto | null) => void;

  turnPlayer: number | null;
  setTurnPlayer: (playerId: number | null) => void;

  isMyTurn: boolean;
  setIsMyTurn: (isMyTurn: boolean) => void;

  gameStatus: GameStatus | null;
  setGameStatus: (status: GameStatus) => void;

  gameHud: gameHUD;
  setGameHUD: (status: gameHUD) => void;

  winner: PlayerGame | null;
  setWinner: (winner: PlayerGame | null) => void;
  
  gameEnded: boolean;
  setGameEnded: (ended: boolean) => void;

  clearGameState: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameId: null,
      setGameId: (gameId) => set({ gameId }),

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
      setTurnPlayer: (player) => set({ turnPlayer: player }),

      isMyTurn: false,
      setIsMyTurn: (isMyTurn) => set({ isMyTurn }),

      player: null,
      setPlayer: (player) => set({ player }),

      gameStatus: null,
      setGameStatus: (status: GameStatus) => set({ gameStatus: status }),

      gameHud: "DEFAULT",
      setGameHUD: (status: gameHUD) => set({ gameHud: status }),

      winner: null,
      setWinner: (winner) => set({ winner }),
      
      gameEnded: false,
      setGameEnded: (ended) => set({ gameEnded: ended }),

      clearGameState: () =>
        set({ 
          territoriesColors: {}, 
          playerObjective: {}, 
          player: null,
          winner: null,
          gameEnded: false
        }),
    }),
    {
      name: "game-store",
      partialize: (state) => ({
        territoriesColors: state.territoriesColors,
        playerObjective: state.playerObjective,
        player: state.player,
        turnPlayer: state.turnPlayer,
        isMyTurn: state.isMyTurn,
        gameStatus: state.gameStatus,
        gameId: state.gameId,
        gameHud: state.gameHud,
        winner: state.winner,
        gameEnded: state.gameEnded
      }),
    }
  )
);
