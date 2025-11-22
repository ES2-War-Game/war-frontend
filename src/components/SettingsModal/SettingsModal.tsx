import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useGameStore } from "../../store/useGameStore";
import { gameService } from "../../service/gameService";
import styles from "./SettingsModal.module.css";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const navigate = useNavigate();
  const { musicEnabled, diceAnimationEnabled, toggleMusic, toggleDiceAnimation } = useSettingsStore();
  const gameId = useGameStore((s) => s.gameId);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveGame = async () => {
    if (isLeaving) return;
    
    const confirmed = window.confirm("Tem certeza que deseja sair da partida?");
    if (!confirmed) return;

    setIsLeaving(true);
    try {
      if (gameId) {
        await gameService.leaveLobby(gameId);
      }
      
      // Limpa o estado do jogo
      useGameStore.getState().clearGameState();
      
      // Navega para o hub
      navigate("/hub");
    } catch (error) {
      console.error("Erro ao sair da partida:", error);
      alert("Erro ao sair da partida. Tente novamente.");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>⚙️ Configurações</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.setting}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>🎵 Música</span>
              <span className={styles.settingDescription}>
                {musicEnabled ? "Ativada" : "Desativada"}
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={musicEnabled}
                onChange={toggleMusic}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.setting}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>🎲 Animação de Dados</span>
              <span className={styles.settingDescription}>
                {diceAnimationEnabled ? "Ativada" : "Desativada"}
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={diceAnimationEnabled}
                onChange={toggleDiceAnimation}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.divider}></div>

          <button
            className={styles.leaveButton}
            onClick={handleLeaveGame}
            disabled={isLeaving}
          >
            {isLeaving ? "Saindo..." : "🚪 Sair da Partida"}
          </button>
        </div>
      </div>
    </div>
  );
}
