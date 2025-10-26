import api from "../interceptor/api";
import type { GameState } from "../types/lobby";

export const gameService = {
  async startGame(lobbyId: number): Promise<GameState> {
    const response = await api.post<GameState>(
      `/api/games/start/${lobbyId}`
    );
    
    return response.data;
  },

  async getCurrentGame(): Promise<GameState | null> {
    try {
      const response = await api.get<GameState>('/api/games/current-game');
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async leaveLobby(lobbyId: number): Promise<void> {
    await api.post(`/api/games/leave/${lobbyId}`);
  },

  async leaveGame(gameId: number): Promise<GameState> {
    const response = await api.post<GameState>(`/api/games/leave-game/${gameId}`);
    return response.data;
  },

  async allocateTroops(
    gameId: number, 
    territoryId: number, 
    count: number
  ): Promise<void> {
    await api.post(`/api/games/${gameId}/allocate`, {
      territoryId,
      count,
    });
  },
};
