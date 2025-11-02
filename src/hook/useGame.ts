import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { gameService } from "../service/gameService";

export const useGame = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Função helper que garante que temos um gameId válido.
   * Se não tiver no store, tenta buscar o jogo atual do backend.
   */
  const ensureGameId = async (): Promise<number | null> => {
    let gameId = useGameStore.getState().gameId;
    
    if (!gameId) {
      console.log("🔍 gameId não encontrado no store, buscando jogo atual...");
      try {
        const currentGame = await gameService.getCurrentGame();
        if (currentGame && 'id' in currentGame) {
          gameId = currentGame.id;
          useGameStore.getState().setGameId(gameId);
          console.log("✅ gameId recuperado e salvo no store:", gameId);
        } else {
          console.warn("⚠️ Nenhum jogo ativo encontrado");
        }
      } catch (err) {
        console.error("❌ Erro ao buscar jogo atual:", err);
      }
    }
    
    return gameId;
  };

  const allocateTroops = async (territoryId: number, count: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const gameId = await ensureGameId();
      if (!gameId) {
        console.warn("⚠️ allocateTroops: não foi possível obter gameId");
        setError("Partida não encontrada. Tente novamente.");
        return;
      }

      console.log(
        `🚀 Allocating ${count} troops to territory ${territoryId} in game ${gameId}...`
      );
      const response = await gameService.allocateTroops(gameId, territoryId, count);

      console.log("resposta",response)
      
      console.log(
        "✅ Allocation request sent. Aguardando atualização via WebSocket..."
      );
    } catch (err: any) {
      console.error("❌ Error allocating troops:", err);
      
      // 🚨 TRATAMENTO ESPECIAL PARA HTTP 409 - Fase Inválida
      if (err?.response?.status === 409) {
        const msg = err.response?.data || "Ação não permitida nesta fase do jogo.";
        console.error("⚠️ ERRO DE FASE (HTTP 409):", msg);
        setError(msg);
        
        // Recarregar estado do jogo para sincronizar
        try {
          console.log("🔄 Sincronizando estado do jogo após erro 409...");
          const currentGame = await gameService.getCurrentGame();
          if (currentGame) {
            useGameStore.getState().setGameStatus(currentGame.status as any);
            console.log("✅ Estado sincronizado. Fase atual:", currentGame.status);
          }
        } catch (syncErr) {
          console.error("❌ Erro ao sincronizar estado:", syncErr);
        }
        
        alert(msg);
        throw err;
      }
      
      if (err?.response?.status === 400) {
        const msg = err.response?.data || "Erro ao alocar tropas";
        setError(msg);
        try {
          alert(msg);
        } catch {}
      } else if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setError("Falha ao alocar tropas. Tente novamente.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const EndTurn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const gameId = await ensureGameId();
      if (!gameId) {
        console.warn("⚠️ EndTurn: não foi possível obter gameId");
        setError("Partida não encontrada. Tente novamente.");
        return;
      }

      
      await gameService.endTrun(gameId);
      console.log(
        "✅ EndTurn request sent. Aguardando atualização via WebSocket..."
      );
    } catch (err: any) {
      console.error("❌ Error EndTurn:", err);
      
      // 🚨 TRATAMENTO ESPECIAL PARA HTTP 409 - Fase Inválida
      if (err?.response?.status === 409) {
        const msg = err.response?.data || "Ação não permitida nesta fase do jogo.";
        console.error("⚠️ ERRO DE FASE (HTTP 409):", msg);
        setError(msg);
        
        // Recarregar estado do jogo para sincronizar
        try {
          console.log("🔄 Sincronizando estado do jogo após erro 409...");
          const currentGame = await gameService.getCurrentGame();
          if (currentGame) {
            useGameStore.getState().setGameStatus(currentGame.status as any);
            console.log("✅ Estado sincronizado. Fase atual:", currentGame.status);
          }
        } catch (syncErr) {
          console.error("❌ Erro ao sincronizar estado:", syncErr);
        }
        
        alert(msg);
        throw err;
      }
      
      if (err?.response?.status === 400) {
        const msg = err.response?.data || "Erro ao terminar turno";
        setError(msg);
        try {
          alert(msg);
        } catch {}
      } else if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setError("Falha ao terminar turno. Tente novamente.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const attack = async (
    sourceTerritoryId: number,
    targetTerritoryId: number,
    attackDiceCount: number
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const gameId = await ensureGameId();
      if (!gameId) {
        console.warn("⚠️ attack: não foi possível obter gameId");
        setError("Partida não encontrada. Tente novamente.");
        return;
      }

      console.log(
        `⚔️ Attacking from ${sourceTerritoryId} to ${targetTerritoryId} with ${attackDiceCount} in game ${gameId}...`
      );
      
      // troopsToMoveAfterConquest deve ser pelo menos 1 e no máximo attackDiceCount
      // No War, você move as tropas que atacaram após conquistar o território
      const troopsToMove = Math.min(attackDiceCount, 3); // Máximo 3 tropas movem
      
      console.log(`📦 Tropas a mover após conquista: ${troopsToMove}`);
      
      await gameService.attack(gameId, sourceTerritoryId, targetTerritoryId, attackDiceCount, troopsToMove);
      console.log(
        "✅ Attack request sent. Aguardando atualização via WebSocket..."
      );
    } catch (err: any) {
      console.error("❌ Error attacking:", err);
      
      // 🚨 TRATAMENTO ESPECIAL PARA HTTP 409 - Fase Inválida
      if (err?.response?.status === 409) {
        const msg = err.response?.data || "Ação não permitida nesta fase do jogo.";
        console.error("⚠️ ERRO DE FASE (HTTP 409):", msg);
        setError(msg);
        
        // Recarregar estado do jogo para sincronizar
        try {
          console.log("🔄 Sincronizando estado do jogo após erro 409...");
          const currentGame = await gameService.getCurrentGame();
          if (currentGame) {
            useGameStore.getState().setGameStatus(currentGame.status as any);
            console.log("✅ Estado sincronizado. Fase atual:", currentGame.status);
          }
        } catch (syncErr) {
          console.error("❌ Erro ao sincronizar estado:", syncErr);
        }
        
        alert(msg);
        throw err;
      }
      
      if (err?.response?.status === 400) {
        const msg = err.response?.data || "Erro ao atacar";
        setError(msg);
        try {
          alert(msg);
        } catch {}
      } else if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setError("Falha ao atacar. Tente novamente.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  return { isLoading, error, allocateTroops, EndTurn, attack };
};
