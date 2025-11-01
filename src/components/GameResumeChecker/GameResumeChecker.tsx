import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { gameService } from "../../service/gameService";
import GameResumeModal from "../GameResumeModal/gameResumeModal";
import type { GameState } from "../../types/lobby";

/**
 * Componente que verifica se o usuário tem um jogo ativo
 * e mostra o modal GameResumeModal em qualquer página.
 * 
 * Só verifica quando o usuário está autenticado e não está
 * nas páginas /game ou /game-setup (para evitar modal duplicado).
 */
export default function GameResumeChecker() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [activeGame, setActiveGame] = useState<GameState | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Só verifica se:
    // 1. Usuário está autenticado
    // 2. Não está na página de jogo ou game-setup (para evitar modal duplicado)
    const isGamePage = location.pathname === "/game" || location.pathname === "/game-setup";
    
    if (!user || isGamePage) {
      return;
    }

    const checkActiveGame = async () => {
      try {
        console.log("🔍 GameResumeChecker: Verificando se há jogo ativo...");
        const game = await gameService.getCurrentGame();
        
        if (game) {
          console.log("🎮 GameResumeChecker: Jogo ativo encontrado:", game);
          setActiveGame(game);
          setShowModal(true);
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
  }, [user, location.pathname, showModal, activeGame]);

  const handleClose = () => {
    setShowModal(false);
    // Não limpa activeGame para evitar verificações desnecessárias
  };

  if (!showModal || !activeGame) {
    return null;
  }

  return <GameResumeModal game={activeGame} onClose={handleClose} />;
}
