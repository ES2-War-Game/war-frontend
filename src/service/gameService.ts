import api from "../interceptor/api";
import type { GameStateResponseDto, CurrentTurnResponse } from "../types/game";
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>("/api/games/current-game");
      console.log("📡 getCurrentGame response (raw):", {
        hasData: !!response.data,
        fullData: response.data
      });
      
      if (!response.data) {
        return null;
      }
      
      // 🔄 Normaliza a resposta do backend (que pode vir com campos diferentes)
      const normalized: GameState = {
        id: response.data.id || response.data.gameId,
        name: response.data.name || response.data.lobbyName || response.data.gameName,
        status: response.data.status,
        createdAt: response.data.createdAt || new Date().toISOString(),
        cardSetExchangeCount: response.data.cardSetExchangeCount || 0,
        playerGames: response.data.playerGames || response.data.players || [],
        players: response.data.players || response.data.playerGames || [],
        currentTurnPlayerId: response.data.currentTurnPlayerId,
        turnPlayer: response.data.turnPlayer,
        winner: response.data.winner,
        gameTerritories: response.data.gameTerritories || response.data.territories,
        territories: response.data.territories || response.data.gameTerritories,
        maxPlayers: response.data.maxPlayers || response.data.playerCount
      };
      
      console.log("✅ getCurrentGame normalized:", {
        id: normalized.id,
        name: normalized.name,
        status: normalized.status
      });
      
      return normalized;
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

  async getCurrentTurn(gameId: number): Promise<CurrentTurnResponse> {
    const response = await api.get<CurrentTurnResponse>(
      `/api/games/${gameId}/current-turn`
    );
    return response.data;
  },

  async attack(
    gameId: number,
    sourceTerritoryId: number,
    targetTerritoryId: number,
    attackDiceCount: number,
    troopsToMoveAfterConquest: number
  ): Promise<void> {
    const requestBody = {
      sourceTerritoryId,
      targetTerritoryId,
      attackDiceCount,
      troopsToMoveAfterConquest
    };
    
    console.log("🎯 Sending attack request:");
    console.log("  - URL:", `/api/games/${gameId}/attack`);
    console.log("  - Body:", requestBody);
    console.log("  - Body stringified:", JSON.stringify(requestBody, null, 2));
    
    try {
      const response = await api.post(`/api/games/${gameId}/attack`, requestBody);
      console.log("✅ Attack response:", response);
      return response.data;
    } catch (error: any) {
      console.error("❌ Attack failed!");
      console.error("  - Status:", error?.response?.status);
      console.error("  - Error data:", error?.response?.data);
      console.error("  - Full error:", error);
      throw error;
    }
  },
};
