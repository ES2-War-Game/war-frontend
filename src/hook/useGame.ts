import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { gameService } from "../service/gameService";

export const useGame = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allocateTroops = async (territoryId: number, count: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const gameId = useGameStore.getState().gameId;
      if (!gameId) {
        console.warn("⚠️ allocateTroops chamado sem gameId no store");
        setError("Partida não encontrada. Tente novamente.");
        return;
      }

      console.log(
        `🚀 Allocating ${count} troops to territory ${territoryId} in game ${gameId}...`
      );
      await gameService.allocateTroops(gameId, territoryId, count);
      
      console.log(
        "✅ Allocation request sent. Aguardando atualização via WebSocket..."
      );
    } catch (err: any) {
      console.error("❌ Error allocating troops:", err);
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

      const gameId = useGameStore.getState().gameId;
      if (!gameId) {
        console.warn("⚠️ EndTurn chamado sem gameId no store");
        setError("Partida não encontrada. Tente novamente.");
        return;
      }

      
      await gameService.endTrun(gameId);
      console.log(
        "✅ EndTurn request sent. Aguardando atualização via WebSocket..."
      );
    } catch (err: any) {
      console.error("❌ Error EndTurn:", err);
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
  return { isLoading, error, allocateTroops, EndTurn };
};
