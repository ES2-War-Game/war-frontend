import api from "../interceptor/api";
import type { GameStateResponseDto } from "../types/game";
import type { GameState } from "../types/lobby";

export const gameService = {
  async startGame(lobbyId: number): Promise<GameStateResponseDto> {
    const response = await api.post<GameStateResponseDto>(
      `/api/games/start/${lobbyId}`
    );

    return response.data;
  },

  async getCurrentGame(): Promise<GameState | null> {
    try {
      const response = await api.get<GameState>("/api/games/current-game");
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
    const response = await api.post<GameState>(
      `/api/games/leave-game/${gameId}`
    );
    return response.data;
  },

  async allocateTroops(
    gameId: number,
    territoryId: number,
    count: number
  ): Promise<void> {
    // Backend controller expects @RequestParam for territoryId and count, not a JSON body
    await api.post(`/api/games/${gameId}/allocate`, null, {
      params: {
        territoryId,
        count,
      },
    });
  },

  async endTrun(gameId: number): Promise<void> {
    await api.post(`/api/games/${gameId}/end-turn`, null, {});
  },

  async attack(
    gameId: number,
    attackerId: number,
    defenderId: number,
    count: number
  ): Promise<void> {
    // Segue o mesmo padrão de usar @RequestParam
    await api.post(`/api/games/${gameId}/attack`, null, {
      params: { attackerId, defenderId, count },
    });
  },
};
