import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./GameEndModal.module.css";
import type { PlayerGame } from "../../types/lobby";

interface GameEndModalProps {
  winner: PlayerGame;
  isCurrentPlayerWinner: boolean;
  onClose: () => void;
  onViewGameState?: () => void;
}

export default function GameEndModal({ winner, isCurrentPlayerWinner, onClose, onViewGameState }: GameEndModalProps) {
  const navigate = useNavigate();

  // Debug: Log quando o modal é montado
  useEffect(() => {
    console.log("🎭 GameEndModal MONTADO!", {
      winner: winner.player.username,
      isCurrentPlayerWinner,
      objective: winner.objective?.description
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToHub = () => {
    onClose();
    navigate("/hub");
  };

  const handleViewGame = () => {
    if (onViewGameState) {
      onViewGameState();
    }
  };

  return createPortal(
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${isCurrentPlayerWinner ? styles.victory : styles.defeat}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isCurrentPlayerWinner ? "🎉 VITÓRIA!" : "😢 Derrota"}
          </h1>
        </div>

        <div className={styles.content}>
          <div className={styles.winnerSection}>
            <div 
              className={styles.winnerAvatar}
              style={{ borderColor: winner.color }}
            >
              {winner.player.imageUrl ? (
                <img src={winner.player.imageUrl} alt={winner.player.username} />
              ) : (
                <div className={styles.defaultAvatar}>
                  {winner.player.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className={styles.winnerName}>
              {isCurrentPlayerWinner ? "Você venceu!" : winner.player.username}
            </h2>

            <div 
              className={styles.colorBadge}
              style={{ backgroundColor: winner.color }}
            >
              {winner.color}
            </div>
          </div>

          {winner.objective && (
            <div className={styles.objectiveSection}>
              <h3>🎯 Objetivo Completado:</h3>
              <p className={styles.objectiveText}>
                {winner.objective.description}
              </p>
            </div>
          )}

          {isCurrentPlayerWinner && (
            <div className={styles.congratulations}>
              <p>Parabéns! Você completou seu objetivo e conquistou a vitória!</p>
            </div>
          )}

          {!isCurrentPlayerWinner && (
            <div className={styles.motivationalMessage}>
              <p>Não desanime! A próxima vitória será sua!</p>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.viewGameButton}
            onClick={handleViewGame}
          >
            👁️ Ver Estado do Jogo
          </button>
          <button 
            className={styles.backButton}
            onClick={handleBackToHub}
          >
            🚪 Sair para o Lobby
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
