import React, { useEffect } from "react";
import Map from "../../components/Map/Map";
import background from "../../assets/Game_background.jpg";
import GameHUD from "../../components/GameHUD/gameHUD";
import ObjectiveButton from "../../components/ObjectiveButton/ObjectiveButton";
import GameEndModal from "../../components/GameEndModal/GameEndModal";
import GameEndViewHUD from "../../components/GameEndViewHUD/GameEndViewHUD";
// import AttackAnimation from "../../components/AttackAnimation/AttackAnimation";
import { useGameStore } from "../../store/useGameStore";
import { useMapStore } from "../../store/useMapStore";
import { useLobbyWebSocket } from "../../hook/useWebSocket";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import type { GameStatus } from "../../types/lobby";
import { useAttackStore } from "../../store/useAttackStore";
import { useMovementStore } from "../../store/useMovementStore";
import { useAllocateStore } from "../../store/useAllocate";
// turn-based info is handled inside HUD and store-connected components

export default function Game() {
  // 🔥 CRITICAL: Ativa WebSocket para receber atualizações do jogo
  useLobbyWebSocket();
  

  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.getUserId?.());
  const winner = useGameStore((s) => s.winner);
  const gameEnded = useGameStore((s) => s.gameEnded);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const gameId = useGameStore((s) => s.gameId);
  const setGameEnded = useGameStore((s) => s.setGameEnded);
  const setWinner = useGameStore((s) => s.setWinner);
  const setGameHUD = useGameStore((s) => s.setGameHUD);
  // Tornar dependências reativas para bloquear movimento/zoom quando em ações (ataque/alocação/movimento)
  const atacanteId = useAttackStore((s) => s.atacanteId);
  const sourceTerritoyId = useMovementStore((s) => s.sourceTerritoryId);
  const allocating = useAllocateStore((s) => s.allocating);
  // Pega gameHUD de forma reativa (usado para bloquear câmera fora do modo DEFAULT)
  const gameHUD = useGameStore((s) => s.gameHud);

  const resetAttack= useAttackStore.getState().resetAttack
  const resetMove= useMovementStore.getState().resetMove

  // Estado para controlar se está visualizando o jogo ou mostrando o modal
  const [isViewingGame, setIsViewingGame] = React.useState(false);

  // 🔧 Reset gameHud ao montar o componente (fix para quando recarrega a página)
  React.useEffect(() => {
    console.log("🔄 Resetando gameHud para DEFAULT ao montar Game.tsx");
    setGameHUD("DEFAULT");
  }, [setGameHUD]); // Executa ao montar (setGameHUD é estável do Zustand)

  

  // � Sincroniza gameStatus com backend ao montar (fix para quando recarrega a página)
  const hasSyncedStatus = React.useRef(false);
  React.useEffect(() => {
    const syncGameStatus = async () => {
      if (hasSyncedStatus.current || !gameId) return;

      console.log(
        "🔄 Sincronizando gameStatus com backend ao montar Game.tsx",
        {
          gameId,
          currentGameStatus: gameStatus,
        }
      );

      try {
        const { gameService } = await import("../../service/gameService");
        const { extractTerritoryInfo } = await import("../../utils/gameState");
        const currentGame = await gameService.getCurrentGame();

        if (currentGame) {
          console.log("📥 Jogo carregado ao recarregar página:", {
            status: currentGame.status,
            totalTerritories: currentGame.gameTerritories?.length,
            hasTerritoryData: !!currentGame.gameTerritories,
          });

          // Atualiza o status do jogo
          if (currentGame.status !== gameStatus) {
            console.log("⚠️ GameStatus desatualizado! Atualizando...", {
              localStorage: gameStatus,
              backend: currentGame.status,
            });
            useGameStore
              .getState()
              .setGameStatus(currentGame.status as GameStatus);
          } else {
            console.log("✅ GameStatus está sincronizado:", currentGame.status);
          }

          // 🔥 CRÍTICO: Extrai e persiste informações dos territórios (incluindo staticArmies e movedInArmies)
          if (
            currentGame.gameTerritories &&
            currentGame.gameTerritories.length > 0
          ) {
            console.log(
              "🗺️ Extraindo informações dos territórios ao recarregar..."
            );
            // Cast para o tipo esperado pela função
            const gameData =
              currentGame as unknown as import("../../types/game").GameStateResponseDto;
            const territoriesColors = extractTerritoryInfo(gameData);
            useGameStore.getState().setTerritoriesColors(territoriesColors);
            console.log("✅ Territórios atualizados ao recarregar:", {
              totalTerritories: Object.keys(territoriesColors).length,
              sampleTerritory: Object.values(territoriesColors)[0],
            });
          }
        }
      } catch (error) {
        console.error("❌ Erro ao sincronizar gameStatus:", error);
      }

      hasSyncedStatus.current = true;
    };

    syncGameStatus();
  }, [gameId, gameStatus]);

  // 🔧 Limpa estados de jogo anterior ao montar (fix para quando abandona e entra em novo jogo)
  const hasClearedOnMount = React.useRef(false);
  React.useEffect(() => {
    if (hasClearedOnMount.current) return;

    console.log(
      "🧹 Verificando se precisa limpar estado de jogo anterior ao montar Game.tsx",
      {
        gameEnded,
        winner: winner?.player?.username,
        gameId,
      }
    );

    // Se há winner ou gameEnded do jogo anterior, limpa ao montar
    if (gameEnded || winner) {
      console.log(
        "⚠️ Detectado estado de jogo anterior! Limpando winner e gameEnded..."
      );
      setGameEnded(false);
      setWinner(null);
    }

    hasClearedOnMount.current = true;
  }, [gameEnded, winner, gameId, setGameEnded, setWinner]); // Executa apenas ao montar

  // 🔍 Fallback: Se o gameStatus é FINISHED mas gameEnded é false, corrige
  React.useEffect(() => {
    if (gameStatus === "FINISHED" && !gameEnded) {
      console.log(
        "⚠️ FALLBACK: gameStatus é FINISHED mas gameEnded é false. Corrigindo..."
      );
      setGameEnded(true);
    }
  }, [gameStatus, gameEnded, setGameEnded]);

  //  Fallback 2: Se o jogo está finalizado mas não tem winner, busca da API
  React.useEffect(() => {
    const fetchGameState = async () => {
      if ((gameEnded || gameStatus === "FINISHED") && !winner && gameId) {
        console.log(
          "⚠️ FALLBACK 2: Jogo finalizado sem winner. Buscando da API..."
        );

        try {
          const { gameService } = await import("../../service/gameService");
          // Busca o jogo atual do jogador (retorna GameState com winner se finalizado)
          const currentGame = await gameService.getCurrentGame();

          console.log("📥 Jogo atual da API:", {
            hasGame: !!currentGame,
            gameId: currentGame?.id,
            status: currentGame?.status,
            hasWinner: !!currentGame?.winner,
            winnerName: currentGame?.winner?.player?.username,
            fullWinner: currentGame?.winner,
          });

          if (currentGame?.winner) {
            console.log("✅ Winner encontrado na API! Salvando no store...");
            setWinner(currentGame.winner);
            setGameEnded(true);
          } else {
            console.log("⚠️ API não retornou winner. Possíveis causas:", {
              gameExists: !!currentGame,
              gameStatus: currentGame?.status,
              suggestion:
                "O jogo pode ter sido reiniciado ou o backend não salvou o winner",
            });
          }
        } catch (error) {
          console.error("❌ Erro ao buscar jogo atual:", error);
        }
      }
    };

    fetchGameState();
  }, [gameEnded, gameStatus, winner, gameId, setWinner, setGameEnded]);

  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  // Removed unused turn/owner checks; HUD handles turn-based messaging

  const dragging = React.useRef(false);
  const last = React.useRef({ x: 0, y: 0 });
  const targetPos = React.useRef({ x: 0, y: 0 }); // alvo para interpolação

  const [spacePressed, setSpacePressed] = React.useState(false);

  // Handler para fechar o modal de fim de jogo e voltar ao lobby
  const handleCloseEndModal = () => {
    setGameEnded(false);
    setWinner(null);
    setIsViewingGame(false);
    navigate("/hub");
  };

  // Handler para visualizar o estado do jogo
  const handleViewGameState = () => {
    setIsViewingGame(true);
  };

  // Handler para voltar ao modal de resultado
  const handleBackToModal = () => {
    setIsViewingGame(false);
  };

  // Verificar se o jogador atual é o vencedor
  const isCurrentPlayerWinner =
    winner && userId ? String(winner.player.id) === String(userId) : false;

  // 🎭 Log de debug da renderização do modal (só quando valores mudarem)
  React.useEffect(() => {
    const isGameFinished = gameEnded || gameStatus === "FINISHED";
    const shouldShow = isGameFinished && winner && !isViewingGame;

    console.log("🎭 Renderização Modal:", {
      gameEnded,
      gameStatus,
      isGameFinished,
      hasWinner: !!winner,
      isViewingGame,
      shouldShow,
    });
  }, [gameEnded, gameStatus, winner, isViewingGame]);

  // 🐛 Debug: Log quando o componente renderiza
  React.useEffect(() => {
    console.log("🎮 Game Component Montado");
    console.log("📊 Estado inicial:", {
      gameEnded,
      hasWinner: !!winner,
      winnerName: winner?.player?.username,
      isViewingGame,
      userId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clampPosition(x: number, y: number, zoom: number) {
    const VIEWPORT_WIDTH = window.innerWidth;
    const VIEWPORT_HEIGHT = window.innerHeight;
    const MAP_WIDTH = 2000;
    const MAP_HEIGHT = 1100;

    const maxX = 0;
    const maxY = 0;
    const minX = VIEWPORT_WIDTH - MAP_WIDTH * zoom;
    const minY = VIEWPORT_HEIGHT - MAP_HEIGHT * zoom;

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  }

  // Loop de suavização
  React.useEffect(() => {
    let anim: number;

    function animate() {
      setPos((prev) => {
        // interpolação (lerp) para suavizar
        const smooth = 0.15; // ajuste: menor valor = mais suave
        const newX = prev.x + (targetPos.current.x - prev.x) * smooth;
        const newY = prev.y + (targetPos.current.y - prev.y) * smooth;

        return { x: newX, y: newY };
      });
      anim = requestAnimationFrame(animate);
    }

    anim = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(anim);
  }, []);

  // Sincroniza posição e zoom do mapa com o MapStore para uso na animação
  React.useEffect(() => {
    useMapStore.getState().setTransform(pos, zoom);
  }, [pos, zoom]);

  useEffect(()=>{
    resetAttack()
    resetMove()
  },[])

  // Detecta espaço e zoom (apenas quando não estiver atacando / alocando / movendo)
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const blocked = atacanteId || sourceTerritoyId || allocating || gameHUD !== "DEFAULT";
      if (blocked) return; // Ignora qualquer input enquanto em ação

      if (e.code === "Space") {
        setSpacePressed(true);
        e.preventDefault();
      }
      if (e.ctrlKey && (e.key === "+" || e.key === "=")) {
        setZoom((z) => Math.min(z + 0.1, 3));
        e.preventDefault();
      }
      if (e.ctrlKey && (e.key === "-" || e.key === "_")) {
        setZoom((z) => Math.max(z - 0.1, 0.3));
        e.preventDefault();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") setSpacePressed(false);
    }

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [atacanteId, sourceTerritoyId, allocating, gameHUD]);

  // Se entrar em um estado bloqueado, garante que espaço/drag parem imediatamente
  React.useEffect(() => {
    const blocked = atacanteId || sourceTerritoyId || allocating || gameHUD !== "DEFAULT";
    if (blocked) {
      setSpacePressed(false);
      dragging.current = false;
    }
  }, [atacanteId, sourceTerritoyId, allocating, gameHUD]);

  const SPEED = 1.5; // ajuste fino da velocidade
  // Pan
  React.useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (e.button === 0 && spacePressed) {
        dragging.current = true;
        last.current = { x: e.clientX, y: e.clientY };

        function onMouseMove(ev: MouseEvent) {
          if (dragging.current) {
            const deltaX = (ev.clientX - last.current.x) * SPEED;
            const deltaY = (ev.clientY - last.current.y) * SPEED;

            const newTarget = clampPosition(
              targetPos.current.x + deltaX,
              targetPos.current.y + deltaY,
              zoom
            );

            targetPos.current = newTarget;
            last.current = { x: ev.clientX, y: ev.clientY };
          }
        }

        function onMouseUp() {
          dragging.current = false;
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        }

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        e.preventDefault();
      }
    }

    window.addEventListener("mousedown", onMouseDown, true);
    return () => window.removeEventListener("mousedown", onMouseDown, true);
  }, [spacePressed, zoom]);

  

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        backgroundImage: `linear-gradient(rgba(0,0,255,0.3), rgba(0,0,255,0.3)), url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        userSelect: dragging.current ? "none" : undefined,
        cursor: spacePressed
          ? dragging.current
            ? "grabbing"
            : "grab"
          : undefined,
      }}
    >
      {/* Attack Animation Layer - DESATIVADO TEMPORARIAMENTE */}
      {/* <AttackAnimation /> */}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "4000px",
          height: "2000px",
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
          transformOrigin: "top left",
          // ⚠ removi transition pra não engasgar
        }}
      >
        <Map />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        {gameHUD == "DEFAULT" ? <GameHUD /> : null}
      </div>
      <ObjectiveButton />

      {/* Modal de Fim de Jogo - Aparece quando o jogo terminou E não está visualizando */}
      {(() => {
        // Verifica se o jogo terminou por gameEnded OU por gameStatus
        const isGameFinished = gameEnded || gameStatus === "FINISHED";
        const shouldShow = isGameFinished && winner && !isViewingGame;

        return shouldShow ? (
          <GameEndModal
            winner={winner}
            isCurrentPlayerWinner={isCurrentPlayerWinner}
            onClose={handleCloseEndModal}
            onViewGameState={handleViewGameState}
          />
        ) : null;
      })()}

      {/* HUD de Visualização - Aparece quando está visualizando o jogo finalizado */}
      {(gameEnded || gameStatus === "FINISHED") && winner && isViewingGame && (
        <GameEndViewHUD onBackToModal={handleBackToModal} />
      )}
    </div>
  );
}
