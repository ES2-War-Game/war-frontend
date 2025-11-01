import React from "react";
import Map from "../../components/Map/Map";
import background from "../../assets/Game_background.jpg";
import GameHUD from "../../components/GameHUD/gameHUD";
import ObjectiveButton from "../../components/ObjectiveButton/ObjectiveButton";
import { useAllocateStore } from "../../store/useAllocate";
import { useGameStore } from "../../store/useGameStore";
import { useLobbyWebSocket } from "../../hook/useWebSocket";
// turn-based info is handled inside HUD and store-connected components

export default function Game() {
  // 🔥 CRITICAL: Ativa WebSocket para receber atualizações do jogo
  useLobbyWebSocket();
  
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  // Removed unused turn/owner checks; HUD handles turn-based messaging

  const dragging = React.useRef(false);
  const last = React.useRef({ x: 0, y: 0 });
  const targetPos = React.useRef({ x: 0, y: 0 }); // alvo para interpolação

  const [spacePressed, setSpacePressed] = React.useState(false);

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

  // Detecta espaço e zoom
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
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
  }, []);

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

  


  const gameHUD = useGameStore.getState().gameHud;

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
        {gameHUD=="DEFAULT" ? <GameHUD /> : null}
      </div>
      <ObjectiveButton />
    </div>
  );
}
