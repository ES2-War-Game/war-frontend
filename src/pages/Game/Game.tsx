import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Map from "../../components/Map/Map";
import background from "../../assets/Game_background.jpg";
import GameHUD from "../../components/GameHUD/gameHUD";
import ObjectiveButton from "../../components/ObjectiveButton/ObjectiveButton";
import CardsButton from "../../components/CardsButton/CardsButton";
import GameEndModal from "../../components/GameEndModal/GameEndModal";
import GameEndViewHUD from "../../components/GameEndViewHUD/GameEndViewHUD";
import ContinentInfo from "../../components/ContinentInfo/ContinentInfo";
import { useGameStore } from "../../store/useGameStore";
import { useMapStore } from "../../store/useMapStore";
import { useLobbyWebSocket } from "../../hook/useWebSocket";
import { useAuthStore } from "../../store/useAuthStore";
import type { GameStatus } from "../../types/lobby";
import { useAttackStore } from "../../store/useAttackStore";
import { useMovementStore } from "../../store/useMovementStore";
import { useAllocateStore } from "../../store/useAllocate";
import { gameService } from "../../service/gameService";
import { extractTerritoryInfo } from "../../utils/gameState";
import type { GameStateResponseDto } from "../../types/game";
import type { PlayerGameDto } from "../../types/player";

export default function Game() {
  const { gameId: gameIdFromParams } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  // Sempre chama o hook, mas só conecta se for liveGame
  const isLiveGame = !gameIdFromParams;
  useLobbyWebSocket(isLiveGame);

  const userId = useAuthStore((s) => s.getUserId?.());
  const {
    winner,
    gameEnded,
    gameStatus,
    setGameEnded,
    setWinner,
    setGameHUD,
    setGameId,
    setTerritoriesColors,
    setGameStatus,
    setPlayer,
  } = useGameStore();

  const atacanteId = useAttackStore((s) => s.atacanteId);
  const sourceTerritoyId = useMovementStore((s) => s.sourceTerritoryId);
  const allocating = useAllocateStore((s) => s.allocating);
  const gameHUD = useGameStore((s) => s.gameHud);
  const player = useGameStore(state => state.player);

  const resetAttack = useAttackStore.getState().resetAttack;
  const resetMove = useMovementStore.getState().resetMove;

  const [isViewingGame, setIsViewingGame] = useState(false);
  const [isFinalStateView, setIsFinalStateView] = useState(false);
  const [isLoadingGameData, setIsLoadingGameData] = useState(true);

  // Carrega os dados do jogo quando necessário
  useEffect(() => {
    let mounted = true;
    const loadGameData = async () => {
      try {
        if (gameIdFromParams) {
          // Final state view mode - limpa antes de carregar
          console.log("🧹 Clearing game state before loading final state");
          useGameStore.getState().clearGameState();
          
          console.log("📡 Fetching game by ID:", gameIdFromParams);
          const gameData = await gameService.getGameById(
            Number(gameIdFromParams)
          );
          
          console.log("🎮 Game data loaded:", {
            id: gameData.id,
            status: gameData.status,
            territoriesCount: gameData.gameTerritories?.length,
            playersCount: gameData.playerGames?.length,
            winner: gameData.winner?.player?.username,
            sampleTerritory: gameData.gameTerritories?.[0]
          });
          
          if (mounted && gameData.status === "FINISHED") {
            setGameId(gameData.id);
            setWinner(gameData.winner);
            setGameStatus(gameData.status as GameStatus);
            
            console.log("🔄 Extracting territory info...");
            const territoryInfo = extractTerritoryInfo(gameData);
            
            console.log("🎨 Territory info extracted:", {
              count: Object.keys(territoryInfo).length,
              keys: Object.keys(territoryInfo).slice(0, 5),
              sample: Object.entries(territoryInfo).slice(0, 3).map(([name, info]) => ({
                name,
                color: info.color,
                armies: info.staticArmies,
                ownerId: info.ownerId
              }))
            });
            
            console.log("💾 Setting territories colors in store...");
            setTerritoriesColors(territoryInfo);
            
            // Verify it was set
            const verifyColors = useGameStore.getState().territoriesColors;
            console.log("✅ Verification - territories in store:", {
              count: Object.keys(verifyColors).length,
              sample: Object.keys(verifyColors).slice(0, 3)
            });
            
            setGameEnded(true);
            setIsFinalStateView(true);
            // Em final state view, inicia mostrando o HUD (mapa)
            setIsViewingGame(true);
            // Set player for final state view if current user was part of this game
            const currentPlayerGame = gameData.playerGames.find(
              (pg) => String(pg.player.id) === userId
            );
            if (currentPlayerGame) {
              setPlayer(currentPlayerGame);
            }
          } else if (mounted) {
            // If gameIdFromParams but not finished, or error, redirect
            navigate("/hub");
          }
        } else {
          // Live game mode
          const currentGame = await gameService.getCurrentGame();
          if (mounted && currentGame) {
            setGameId(currentGame.id);
            setWinner(currentGame.winner!);
            setGameStatus(currentGame.status as GameStatus);
            const territoryInfo = extractTerritoryInfo(currentGame as GameStateResponseDto);
            setTerritoriesColors(territoryInfo);
            setGameEnded(currentGame.status === "FINISHED");
            setGameHUD("DEFAULT");
            // Set player for live game
            const currentPlayerGame = currentGame.playerGames.find(
              (pg) => String(pg.player.id) === userId
            );
            if (currentPlayerGame) {
              setPlayer(currentPlayerGame as PlayerGameDto);
            }
          } else if (mounted) {
            // If no current game, redirect to hub
            navigate("/hub");
          }
        }
      } catch (error) {
        console.error("Failed to load game data:", error);
        if (mounted) navigate("/hub");
      } finally {
        if (mounted) {
          setIsLoadingGameData(false);
        }
      }
    };
    loadGameData();
    return () => {
      mounted = false;
    };
  }, [
    gameIdFromParams,
    userId,
    navigate,
    setGameId,
    setWinner,
    setGameStatus,
    setTerritoriesColors,
    setGameEnded,
    setIsFinalStateView,
    setPlayer,
    setGameHUD,
  ]);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  const handleCloseEndModal = () => {
    setGameEnded(false);
    setWinner(null);
    setIsViewingGame(false);
    if (gameIdFromParams) {
      navigate("/profile");
    } else {
      navigate("/hub");
    }
  };

  const handleViewGameState = () => {
    setIsViewingGame(true);
  };

  const handleBackToModal = () => {
    setIsViewingGame(false);
  };

  const handleToggleModalInFinalState = () => {
    // Alterna entre mostrar o modal e o HUD em visualização final
    setIsViewingGame(!isViewingGame);
  };

  const isCurrentPlayerWinner =
    winner && userId ? String(winner.player.id) === String(userId) : false;

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

  useEffect(() => {
    let anim: number;
    function animate() {
      setPos((prev) => {
        const smooth = 0.15;
        const newX = prev.x + (targetPos.current.x - prev.x) * smooth;
        const newY = prev.y + (targetPos.current.y - prev.y) * smooth;
        return { x: newX, y: newY };
      });
      anim = requestAnimationFrame(animate);
    }
    anim = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(anim);
  }, []);

  useEffect(() => {
    useMapStore.getState().setTransform(pos, zoom);
  }, [pos, zoom]);

  useEffect(() => {
    resetAttack();
    resetMove();
  }, [resetAttack, resetMove]);

  // Disable interactions in final state view
  const interactionsBlocked = isFinalStateView || atacanteId || sourceTerritoyId || allocating || gameHUD !== "DEFAULT";

  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (interactionsBlocked) return;

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
    function onKeyUp(e: globalThis.KeyboardEvent) {
      if (e.code === "Space") setSpacePressed(false);
    }

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [interactionsBlocked]);

  useEffect(() => {
    if (interactionsBlocked) {
      setSpacePressed(false);
      dragging.current = false;
    }
  }, [interactionsBlocked]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (interactionsBlocked) return;

      if (e.button === 0 && spacePressed) {
        dragging.current = true;
        last.current = { x: e.clientX, y: e.clientY };

        function onMouseMove(ev: MouseEvent) {
          if (dragging.current) {
            const deltaX = (ev.clientX - last.current.x) * 1.5;
            const deltaY = (ev.clientY - last.current.y) * 1.5;
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
  }, [interactionsBlocked, spacePressed, zoom]);

  // Adiciona loading para o mapa - só mostra loading se realmente estiver carregando
  const showMapLoading = isLoadingGameData;

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
        userSelect: interactionsBlocked ? "none" : undefined,
        cursor: spacePressed
          ? dragging.current
            ? "grabbing"
            : "grab"
          : undefined,
      }}
    >
      {showMapLoading ? (
        <div style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 100}}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando mapa...</span>
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "4000px",
            height: "2000px",
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <Map />
        </div>
      )}
      {!isFinalStateView && gameStatus !== "FINISHED" && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          {gameHUD === "DEFAULT" && <GameHUD />}
        </div>
      )}
      {!isFinalStateView && gameStatus !== "FINISHED" && <ObjectiveButton />}
      <CardsButton playerCards={player?.playerCards || []} />
      <ContinentInfo />

      {(() => {
        const isGameFinished = gameEnded || gameStatus === "FINISHED";
        const shouldShow = isGameFinished && winner && !isViewingGame;
        // Define texto do botão de saída conforme contexto
        const exitButtonText = gameIdFromParams ? "Ir para perfil" : "Sair para o lobby";
        return shouldShow ? (
          <GameEndModal
            winner={winner}
            isCurrentPlayerWinner={isCurrentPlayerWinner}
            onClose={handleCloseEndModal}
            onViewGameState={handleViewGameState}
            exitButtonText={exitButtonText}
          />
        ) : null;
      })()}

      {(gameEnded || gameStatus === "FINISHED") &&
        winner &&
        isViewingGame && (
          <GameEndViewHUD
            onBackToModal={
              isFinalStateView ? handleToggleModalInFinalState : handleBackToModal
            }
          />
        )}
    </div>
  );
}
