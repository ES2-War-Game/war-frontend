import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useGameStore } from "../../store/useGameStore";
import { gameService } from "../../service/gameService";
import GameResumeModal from "../GameResumeModal/gameResumeModal";
import type { GameState } from "../../types/lobby";

/**
 * Componente que verifica se o usuário tem um jogo ativo
 * e mostra o modal GameResumeModal em qualquer página.
 * 
 * Só verifica quando o usuário está autenticado e não está
 * nas páginas /game ou /game-setup (para evitar modal duplicado).
 * 
 * Também sincroniza o gameStore com o jogo atual do backend,
 * limpando estados de jogos antigos/finalizados.
 */
export default function GameResumeChecker() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [activeGame, setActiveGame] = useState<GameState | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Store do jogo atual
  const gameId = useGameStore((s) => s.gameId);
  const clearGameState = useGameStore((s) => s.clearGameState);

  useEffect(() => {
    // Só verifica se:
    // 1. Usuário está autenticado
    // 2. Não está em páginas onde o modal não faz sentido
    const excludedPages = [
      "/game",           // Já está jogando
      "/game-setup",     // Está configurando um jogo
      "/jogadores"       // Está no lobby (já sabe que tem jogo ativo)
    ];
    
    const isExcludedPage = excludedPages.includes(location.pathname);
    
    if (!user || isExcludedPage) {
      return;
    }

    const checkActiveGame = async () => {
      try {
        console.log("🔍 GameResumeChecker: Verificando se há jogo ativo...");
        const game = await gameService.getCurrentGame();
        
        // 🧹 Limpa o store se há um jogo diferente salvo no localStorage
        if (gameId && game && game.id !== gameId) {
          console.log("🧹 GameResumeChecker: Jogo no store (id: " + gameId + ") diferente do backend (id: " + game.id + "). Limpando store...");
          clearGameState();
        }
        
        // 🧹 Limpa o store se não há jogo ativo mas tem gameId salvo
        if (gameId && !game) {
          console.log("🧹 GameResumeChecker: Nenhum jogo ativo no backend mas há gameId no store. Limpando...");
          clearGameState();
        }
        
        if (game) {
          console.log("🎮 GameResumeChecker: Jogo encontrado:", {
            id: game.id,
            name: game.name,
            status: game.status,
            isFinished: game.status === "FINISHED",
            fullGame: game
          });
          
          // ⚠️ Verificar se o nome está presente
          if (!game.name || game.name === "undefined") {
            console.warn("⚠️ GameResumeChecker: Nome do jogo está undefined! Objeto completo:", game);
          }
          
          // ⚠️ Só mostra o modal se o jogo NÃO estiver finalizado
          if (game.status !== "FINISHED") {
            console.log("✅ GameResumeChecker: Jogo ativo encontrado (não finalizado)");
            setActiveGame(game);
            setShowModal(true);
          } else {
            console.log("⏭️ GameResumeChecker: Jogo já finalizado, não mostrando modal de retomada");
            // Limpa o store se o jogo está finalizado
            if (gameId === game.id) {
              console.log("🧹 GameResumeChecker: Limpando store do jogo finalizado");
              clearGameState();
            }
          }
        } else {
          console.log("✅ GameResumeChecker: Nenhum jogo ativo");
        }
      } catch (error) {
        console.error("❌ GameResumeChecker: Erro ao verificar jogo ativo:", error);
      }
    };

    // Só verifica quando o usuário faz login (user muda de null para objeto)
    // ou quando navega para uma página que não é /game ou /game-setup
    if (!showModal && !activeGame) {
      checkActiveGame();
    }
  }, [user, location.pathname, showModal, activeGame, gameId, clearGameState]);

  const handleClose = () => {
    setShowModal(false);
    // Não limpa activeGame para evitar verificações desnecessárias
  };

  if (!showModal || !activeGame) {
    return null;
  }

  return <GameResumeModal game={activeGame} onClose={handleClose} />;
}
