import React from "react";
import styles from "./gameHUD.module.css";
import gunImage from "../../assets/gun.png";
import troopsImage from "../../assets/troops.png";
import setasImage from "../../assets/setas.png";

interface GameHUDProps {
  player: {
    id: string;
    name: string;
    color: string;
    avatar: string;
    troops: number;
  };
  currentPhase: "fortify" | "attack" | "move";
  onSkipPhase: (fromPhase: "fortify" | "attack" | "move") => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  player,
  currentPhase = "fortify",
  onSkipPhase,
}) => {
  const phaseLabels = {
    fortify: "FORTIFICAR TERRITÓRIOS",
    attack: "ATACAR TERRITÓRIOS",
    move: "MOVER TROPAS",
  };

  // Determina para quais fases pode pular
  const canSkipToAttack = false; 
  const canSkipToMove = currentPhase === "attack";

  return (
    <div className={styles.container}>
      <div
        className={styles.playerBanner}
        style={{ backgroundColor: player.color }}
      >
        {player.name.toUpperCase()}
      </div>

      <div className={styles.content}>
        <div className={styles.avatar}>
          <img src={player.avatar} alt={player.name} />
        </div>

        <div className={styles.phasesRow}>
          {/* 🔸 Fase de FORTIFICAR (não pulável) */}
          <div
            className={`${styles.phaseIndicator} ${
              currentPhase === "fortify" ? styles.activePhase : ""
            }`}
          >
            <img src={troopsImage} alt="Fortificar" />
          </div>

          {/* Sempre mostra separador inativo após Fortify */}
          <span className={styles.separatorInactive}>≫</span>

          {/* 🔸 Fase de ATAQUE ( pode ser pulada) */}
          <div
            className={`${styles.phaseIndicator} ${
              currentPhase === "attack" ? styles.activePhase : ""
            }`}
          >
            <img src={gunImage} alt="Atacar" />
          </div>

          {/* Mostra botão de pular apenas se estiver na fase de ataque */}
          {canSkipToMove ? (
            <button
              type="button"
              className={styles.skipButton}
              onClick={() => onSkipPhase("attack")}
              title="Pular para fase de Movimento"
            >
              ≫
            </button>
          ) : (
            <span className={styles.separatorInactive}>≫</span>
          )}

          {/* 🔸 Fase de MOVER  */}
          <div
            className={`${styles.phaseIndicator} ${
              currentPhase === "move" ? styles.activePhase : ""
            }`}
          >
            <img src={troopsImage} alt="Tropas" />
            <img src={setasImage} alt="Setas" className={styles.setas} />
          </div>
        </div>

        <div
          className={styles.troopsCircle}
          style={{ borderColor: player.color }}
        >
          <img
            src={troopsImage}
            alt="Tropas"
            className={styles.troopsIcon}
          />
          <span className={styles.troopsCount}>x{player.troops}</span>
        </div>
      </div>

      <div
        className={styles.currentPhase}
        style={{ backgroundColor: player.color }}
      >
        {phaseLabels[currentPhase]}
      </div>
    </div>
  );
};

export default GameHUD;
