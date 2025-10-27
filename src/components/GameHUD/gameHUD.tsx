import React from "react";
import styles from "./gameHUD.module.css";
import gunImage from "../../assets/gun.png";
import troopsImage from "../../assets/troops.png";
import setasImage from "../../assets/setas.png";
import cavaleiro from "../../assets/cavaleiroImage.png"
import { useGameStore } from "../../store/useGameStore";
import { useAuthStore } from "../../store/useAuthStore";

const GameHUD: React.FC = ({}) => {
  // Map gameStatus to HUD phase
  const gameStatus = useGameStore((s) => s.gameStatus);

  const turnPlayer = useGameStore((s) => s.turnPlayer);
  const player = useGameStore((s) => s.player);
  const userId = useAuthStore((s) => s.getUserId?.());
  const isMyTurn = String(turnPlayer ?? "") == String(userId ?? "");
  const [skipHover, setSkipHover] = React.useState(false);

  // prefer the reactive player color from the store, fallback to prop
  const effectiveColor = player?.color;

  const hexToRgba = (hex: string, alpha = 0.2) => {
    if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
    const h = hex.replace("#", "");
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    // fallback: return transparent variant
    return `rgba(0,0,0,${alpha})`;
  };

  // If it's not the user's turn, show a centered waiting message only
  if (!isMyTurn) {
    return (
      <div className={styles.container}>
        <div
          className={styles.playerBanner}
          style={{ backgroundColor: player?.color }}
        >
          {player?.player.username}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "120px",
            color:"white"
          }}
        >
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 18 }}>
            Esperando turno de outro jogador...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.playerBanner}
        style={{ backgroundColor: player?.color }}
      >
        {player?.player.username.toUpperCase()}
      </div>

      <div className={styles.content}>
        <div className={styles.avatar}>
          <img src={player?.player.imageUrl || cavaleiro } alt={player?.player.username} />
        </div>

        <div className={styles.phasesRow}>
          {/* 🔸 Fase de FORTIFICAR (não pulável) */}
          <div
            className={`${styles.phaseIndicator} ${
              gameStatus === "REINFORCEMENT" ? styles.activePhase : ""
            }`}
          >
            <img src={troopsImage} alt="Fortificar" />
          </div>

          {/* Sempre mostra separador inativo após Fortify */}
          <span className={styles.separatorInactive}>≫</span>

          {/* 🔸 Fase de ATAQUE ( pode ser pulada) */}
          <div
            className={`${styles.phaseIndicator} ${
              gameStatus === "ATTACK" ? styles.activePhase : ""
            }`}
          >
            <img src={gunImage} alt="Atacar" />
          </div>

          {/* Mostra botão de pular apenas se estiver na fase de ataque */}
          {gameStatus==="ATTACK" ? (
            <button
              type="button"
              className={styles.skipButton}
              
              title="Pular para fase de Movimento"
              onMouseEnter={() => setSkipHover(true)}
              onMouseLeave={() => setSkipHover(false)}
              style={{
                color: effectiveColor,
                backgroundColor: skipHover
                  ? hexToRgba(String(effectiveColor), 0.18)
                  : "transparent",
                border: "none",
              }}
            >
              ≫
            </button>
          ) : (
            <span className={styles.separatorInactive}>≫</span>
          )}

          {/* 🔸 Fase de MOVER  */}
          <div
            className={`${styles.phaseIndicator} ${
              gameStatus === "MOVEMENT" ? styles.activePhase : ""
            }`}
          >
            <img src={troopsImage} alt="Tropas" />
            <img src={setasImage} alt="Setas" className={styles.setas} />
          </div>
        </div>

        <div
          className={styles.troopsCircle}
          style={{ borderColor: player?.color }}
        >
          <img src={troopsImage} alt="Tropas" className={styles.troopsIcon} />
          <span className={styles.troopsCount}>
            x{player?.unallocatedArmies}
          </span>
        </div>
      </div>

      <div
        className={styles.currentPhase}
        style={{ backgroundColor: player?.color }}
      >
        {gameStatus}
      </div>
    </div>
  );
};

export default GameHUD;
