import React, { useEffect } from "react";
import styles from "./gameHUD.module.css";
import gunImage from "../../assets/gun.png";
import troopsImage from "../../assets/troops.png";
import setasImage from "../../assets/setas.png";
import cavaleiro from "../../assets/player.png"
import { useGameStore } from "../../store/useGameStore";
import { useAllocateStore } from "../../store/useAllocate";
import { useGame } from "../../hook/useGame";
import { gameService } from "../../service/gameService";

const GameHUD: React.FC = () => {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const player = useGameStore((s) => s.player);
  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const unallocatedArmies = useAllocateStore((s) => s.unallocatedArmies);
  const gameId = useGameStore((s) => s.gameId);
  
  const [skipHover, setSkipHover] = React.useState(false);
  const {EndTurn} = useGame()
  
  const effectiveColor = player?.color;

  // Busca o turno atual ao montar o componente
  useEffect(() => {
    const fetchCurrentTurn = async () => {
      if (!gameId) {
        console.warn("⚠️ GameHUD montado sem gameId");
        return;
      }

      try {
        const turnData = await gameService.getCurrentTurn(gameId);
        console.log("🎮 Turno inicial carregado:", turnData);
        
        // Atualiza o estado no store
        useGameStore.getState().setIsMyTurn(turnData.isMyTurn);
        
        // Atualiza também o turnPlayer se disponível
        if (turnData.currentTurnPlayer) {
          useGameStore.getState().setTurnPlayer(turnData.currentTurnPlayer.playerGameId);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar turno atual:", error);
      }
    };

    fetchCurrentTurn();
  }, [gameId]); // Re-executa se o gameId mudar

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

  async function  handleEndTurn(){
    // Validação para fase de REFORÇO/ALOCAÇÃO INICIAL
    if(gameStatus=="REINFORCEMENT" || gameStatus=="SETUP_ALLOCATION"){
      if(unallocatedArmies>0){
        alert("Você deve alocar todas suas tropas antes de finalizar o turno")
        return;
      }
    }
    
    // Se passou todas as validações, finaliza o turno
    await EndTurn()
  }

  async function handleSkipAttack(){
    // Pula a fase de ataque (vai direto para movimento)
    await EndTurn()
  }

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

        <div className={styles.waiting}>
          <div className={styles.waitingText}>
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
              onClick={handleSkipAttack}
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
            x{unallocatedArmies}
          </span>
        </div>
      </div>

      <div
        className={`${styles.currentPhase} ${(gameStatus==="REINFORCEMENT" || gameStatus==="SETUP_ALLOCATION") && unallocatedArmies>0 ? styles.currentPhaseDisabled : ""}`}
        style={{ backgroundColor: player?.color }}
        onClick={(handleEndTurn)}
        title={(gameStatus==="REINFORCEMENT" || gameStatus==="SETUP_ALLOCATION") && unallocatedArmies>0 ? "Alocar todas as tropas antes de finalizar o turno" : "Finalizar turno"}
        aria-disabled={(gameStatus==="REINFORCEMENT" || gameStatus==="SETUP_ALLOCATION") && unallocatedArmies>0}
      >
        Finalizar turno
      </div>
    </div>
  );
};

export default GameHUD;
