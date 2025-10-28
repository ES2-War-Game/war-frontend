import { useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useGameStore } from "../../store/useGameStore";
import { useAllocateStore } from "../../store/useAllocate";
import AllocateHUD from "../AllocateHUD/AllocateHUD";
import { useAuthStore } from "../../store/useAuthStore";
import { useLobbyStore } from "../../store/lobbyStore";
import { useGame } from "../../hook/useGame";

export interface TerritorySVG {
  nome: string;
  width: string;
  height: string;
  top?: string;
  bottom?: string;
  left?: string;
  rigth?: string;
  x: string;
  y: string;
  corClara: string;
  corEscura: string;
  d1: string;
  d2: string;
  cx: string;
  cy: string;
}

// Cores base dos jogadores
const PLAYER_COLORS: Record<string, string> = {
  blue: "#1e3a8a",
  red: "#b91c1c",
  green: "#166534",
  "#bfa640": "#8a782a",
  purple: "#6d28d9",
  black: "#222",
};

function getDarkerPlayerColor(color: string): string {
  // Normaliza para minúsculo e remove espaços
  const key = color.trim().toLowerCase();
  // Se for cor padrão, retorna a versão escura
  if (PLAYER_COLORS[key]) return PLAYER_COLORS[key];
  // Se for hex, escurece multiplicando cada canal por 0.7
  if (/^#([0-9a-f]{6})$/i.test(key)) {
    const r = Math.floor(parseInt(key.slice(1, 3), 16) * 0.7);
    const g = Math.floor(parseInt(key.slice(3, 5), 16) * 0.7);
    const b = Math.floor(parseInt(key.slice(5, 7), 16) * 0.7);
    return `rgb(${r},${g},${b})`;
  }
  // Se for nome, retorna preto
  return "#222";
}

export default function Territory(territorio: TerritorySVG) {
  const [pais, _setPais] = useState(false);
  const [aloca, setAloca] = useState(false);
  const [alocaFinal, setAlocaFinal] = useState(1);
  const [alocaNum, setAlocaNum] = useState<number>(1);
  const setAllocating = useAllocateStore.getState().setAllocating;
  const unallocatedArmies = useAllocateStore((s) => s.unallocatedArmies);

  // Use lightweight game actions to avoid initializing WebSocket per territory
  const { allocateTroops } = useGame();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [portalRect, setPortalRect] = useState<DOMRect | null>(null);

  // pega o mapa de cores do jogo (persistido)
  const territoriesColors = useGameStore((s) => s.territoriesColors);
  // get the current lobby/game id from the store (don't call a setter here)
  const lobbyId = useLobbyStore((s) => s.currentLobbyId);

  async function AlocarTropa() {
    if(unallocatedArmies<=0){
      alert("Não possui mais solçdados para alocar")
      return
    }
    // try to resolve the territory id from the persisted territoriesColors map
    const info =
      overrideColor && typeof overrideColor === "object"
        ? (overrideColor as { id?: number })
        : territoriesColors[normalizedKey] || territoriesColors[rawKey] || territoriesColors[rawKey.toUpperCase?.()];

    const territoryId = info && typeof info.id !== "undefined" ? Number(info.id) : null;

    if (!territoryId) {
      console.warn("Não foi possível resolver o id do território para:", territorio.nome);
      setAloca(false);
      setAllocating(false);
      return;
    }

    if (!lobbyId) {
      console.warn("Lobby/game id não disponível no store");
      setAloca(false);
      setAllocating(false);
      return;
    }

    try {
      await allocateTroops(territoryId,alocaNum)
      useAllocateStore.getState().setUnallocatedArmies(unallocatedArmies-alocaNum)
      setAlocaFinal(alocaNum);
      setAloca(false);
    } catch (err) {
      console.error("Erro ao alocar tropas:", err);
      // show a simple user feedback; keep UI open so user can retry
      try {
        alert((err as any)?.response?.data || "Falha ao alocar tropas. Tente novamente.");
      } catch (e) {
        // ignore alert failures in non-browser contexts
      }
    } finally {
      setAllocating(false);
    }
  }

  // normaliza chave (remove acentos e deixa minúsculo) para bater com utils
  const normalize = (s: string) =>
    String(s ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const rawKey = (territorio.nome && String(territorio.nome).trim()) || "";
  const normalizedKey = normalize(rawKey);

  // more robust lookup: direct key, normalized key, substring match
  const overrideColor = useMemo(() => {
    if (!normalizedKey) return undefined;

    // exact matches (prefer normalizado, que é como persistimos no store)
    if (territoriesColors[normalizedKey])
      return territoriesColors[normalizedKey];
    if (territoriesColors[rawKey]) return territoriesColors[rawKey];
    if (territoriesColors[rawKey.toUpperCase?.()])
      return territoriesColors[rawKey.toUpperCase?.()];

    // try matching by normalized keys stored in the map
    for (const k of Object.keys(territoriesColors)) {
      if (!k) continue;
      const kn = normalize(k);
      if (kn === normalizedKey) return territoriesColors[k];
      // allow partial matches (e.g. "brazil" vs "brazil (br)")
      if (kn.includes(normalizedKey) || normalizedKey.includes(kn))
        return territoriesColors[k];
    }

    return undefined;
  }, [territoriesColors, rawKey, normalizedKey]);

  // Ensure computedFill is always a string (extract color if object)
  const getFillColor = (fill: any): string =>
    typeof fill === "string"
      ? fill
      : fill && typeof fill.color === "string"
      ? fill.color
      : territorio.corEscura;

  const computedFill = getFillColor(
    overrideColor
      ? overrideColor
      : pais
      ? territorio.corClara
      : territorio.corEscura
  );

  function Alocar() {
    // ownerId can come from the overrideColor object (populated from territoriesColors)
    const ownerId =
      overrideColor && typeof overrideColor === "object"
        ? (overrideColor as any).ownerId
        : null;
    const myId = useAuthStore.getState().getUserId?.();

    // compare as strings to be robust to number/string id shapes
    if (ownerId != null && String(ownerId) === String(myId)) {
      // align portal to the current svg if possible
      if (svgRef.current) {
        try {
          setPortalRect(svgRef.current.getBoundingClientRect());
        } catch (e) {
          setPortalRect(null);
        }
      }
      setAloca(true);
      setAllocating(true);
    }
  }

  return (
    <div>
      <div style={{ zIndex: !aloca ? 5 : 1 }}>
        <svg
          ref={svgRef}
          width={territorio.width}
          height={territorio.height}
          style={{
            position: "absolute",
            bottom: `${territorio.bottom}`,
            top: `${territorio.top}`,
            right: `${territorio.rigth}`,
            left: `${territorio.left}`,
            zIndex: aloca ? 5 : 1,
            // hide original while portal copy is visible to avoid duplicate visuals
            visibility: aloca ? "hidden" : "visible",
          }}
        >
          <g
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (svgRef.current) {
                try {
                  setPortalRect(svgRef.current.getBoundingClientRect());
                } catch (e) {
                  setPortalRect(null);
                }
              }
              Alocar();
            }}
          >
            <path d={territorio.d1} fill={computedFill} />
            {territorio.d2 ? (
              <path
                d={territorio.d2}
                stroke="black"
                strokeOpacity="0.585271"
                strokeWidth="2"
                strokeMiterlimit="4.32165"
                fill={computedFill}
              />
            ) : null}
          </g>

          {/* Esfera de soldados */}
          <g>
            <circle
              cx={territorio.cx}
              cy={territorio.cy}
              r="13"
              fill={getDarkerPlayerColor(computedFill)}
              stroke="#222"
              strokeWidth="2"
              filter="drop-shadow(0 1px 4px rgba(0,0,0,0.5))"
            />

            <text
              x={territorio.cx}
              y={territorio.cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="15"
              fontFamily="TrajanPro, Arial, sans-serif"
              fontWeight="bold"
              fill="#222"
              style={{
                pointerEvents: "none",
                userSelect: "none",
                paintOrder: "stroke",
                stroke: "#fff",
                strokeWidth: "1.5px",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
                zIndex: "3",
              }}
            >
              {alocaFinal}
            </text>
          </g>
          {territorio.nome == "BORNEO" ? (
            <g filter="url(#filter1_f_0_1)">
              <path
                d="M49.932 82.8873C49.732 85.2887 50.3321 84.8884 49.5319 87.6901C49.732 87.8902 46.9313 89.291 46.5312 87.6901C46.1311 86.0891 46.7313 85.2887 46.5312 83.2875C46.3312 81.2863 45.3309 82.0868 44.5307 79.8855C43.7305 77.6842 44.7308 78.8849 45.3309 76.8837C45.9311 74.8825 44.9308 74.8825 44.3307 73.4817C43.7305 72.0809 44.1306 71.6806 44.1306 69.6794C44.1306 67.6783 44.5307 68.4787 45.1309 67.0779C45.731 65.6771 45.1309 62.6753 45.531 61.6747C45.9311 60.6741 47.9316 57.8725 47.9316 56.8719V56.8718C47.9316 55.8712 47.9316 53.8701 47.5315 51.4687C47.1314 49.0672 49.3319 48.0667 50.3321 47.4663C51.3324 46.8659 52.7327 45.8653 54.3331 45.0649C55.9335 44.2644 62.7351 44.6646 64.1355 44.0643C65.5358 43.4639 66.9361 41.2626 67.5363 40.4622C68.1364 39.6617 70.1369 40.0619 71.3372 40.4622C72.5375 40.8624 72.9376 41.6629 73.1376 42.6635C73.3377 43.664 72.5375 44.2644 71.3372 45.0649C70.1369 45.8653 69.1367 49.4675 68.3365 50.268C67.5363 51.0684 64.9357 52.4693 62.335 52.6694C59.7344 52.8695 60.3346 52.2691 57.5339 52.2691C54.7332 52.2691 56.3336 53.4698 56.1335 54.6706C55.9335 55.8713 56.9337 55.8713 58.3341 55.6711C59.7344 55.471 61.7349 55.8713 64.3355 56.2715C66.9361 56.6717 65.3358 57.4722 63.9354 60.0738C62.5351 62.6753 60.3345 61.2745 58.134 61.4746C55.9335 61.6747 56.7337 65.0767 56.9337 67.8784C57.1338 70.68 58.3341 68.6788 59.7344 68.4787C61.1347 68.2786 61.3348 70.0797 61.5348 75.2828C61.7349 80.4858 62.9352 78.2845 64.9357 80.4858C66.9361 82.6871 63.5353 84.4882 61.7349 86.2893C59.9345 88.0903 59.5344 86.0891 57.3338 84.2881C55.1333 82.487 55.7334 81.2863 53.933 78.2845C52.1326 75.2828 52.7327 77.8843 51.7325 79.4852C50.7322 81.0862 50.1321 80.4858 49.932 82.8873Z"
                fill={computedFill}
              />
              <path
                d="M49.932 82.8873C49.732 85.2887 50.3321 84.8884 49.5319 87.6901C49.732 87.8902 46.9313 89.291 46.5312 87.6901C46.1311 86.0891 46.7313 85.2887 46.5312 83.2875C46.3312 81.2863 45.3309 82.0868 44.5307 79.8855C43.7305 77.6842 44.7308 78.8849 45.3309 76.8837C45.9311 74.8825 44.9308 74.8825 44.3307 73.4817C43.7305 72.0809 44.1306 71.6806 44.1306 69.6794C44.1306 67.6783 44.5307 68.4787 45.1309 67.0779C45.731 65.6771 45.1309 62.6753 45.531 61.6747C45.9311 60.6741 47.9316 57.8725 47.9316 56.8719V56.8718C47.9316 55.8712 47.9316 53.8701 47.5315 51.4687C47.1314 49.0672 49.3319 48.0667 50.3321 47.4663C51.3324 46.8659 52.7327 45.8653 54.3331 45.0649C55.9335 44.2644 62.7351 44.6646 64.1355 44.0643C65.5358 43.4639 66.9361 41.2626 67.5363 40.4622C68.1364 39.6617 70.1369 40.0619 71.3372 40.4622C72.5375 40.8624 72.9376 41.6629 73.1376 42.6635C73.3377 43.664 72.5375 44.2644 71.3372 45.0649C70.1369 45.8653 69.1367 49.4675 68.3365 50.268C67.5363 51.0684 64.9357 52.4693 62.335 52.6694C59.7344 52.8695 60.3346 52.2691 57.5339 52.2691C54.7332 52.2691 56.3336 53.4698 56.1335 54.6706C55.9335 55.8713 56.9337 55.8713 58.3341 55.6711C59.7344 55.471 61.7349 55.8713 64.3355 56.2715C66.9361 56.6717 65.3358 57.4722 63.9354 60.0738C62.5351 62.6753 60.3345 61.2745 58.134 61.4746C55.9335 61.6747 56.7337 65.0767 56.9337 67.8784C57.1338 70.68 58.3341 68.6788 59.7344 68.4787C61.1347 68.2786 61.3348 70.0797 61.5348 75.2828C61.7349 80.4858 62.9352 78.2845 64.9357 80.4858C66.9361 82.6871 63.5353 84.4882 61.7349 86.2893C59.9345 88.0903 59.5344 86.0891 57.3338 84.2881C55.1333 82.487 55.7334 81.2863 53.933 78.2845C52.1326 75.2828 52.7327 77.8843 51.7325 79.4852C50.7322 81.0862 50.1321 80.4858 49.932 82.8873Z"
                stroke="black"
                strokeOpacity="0.585271"
                strokeWidth="1.2"
                strokeMiterlimit="4.32165"
                fill={computedFill}
              />
            </g>
          ) : null}
          {territorio.nome != "MADAGASCAR" ? (
            <text
              x={territorio.x}
              y={territorio.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontFamily="TrajanPro, Arial, sans-serif"
              fontWeight="bold"
              fill="white"
              style={{
                pointerEvents: "none",
                userSelect: "none",
                paintOrder: "stroke", // desenha o contorno primeiro
                stroke: "black", // cor do contorno
                strokeWidth: "2px", // espessura do contorno
                filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.6))", // sombra leve
              }}
            >
              {territorio.nome}
            </text>
          ) : null}
        </svg>
      </div>
      {aloca &&
        createPortal(
          <div
            onClick={() => {
              setAloca(false);
              setAllocating(false);
            }}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 5,
              width: "100vw",
              height: "100vh",
              position: "fixed",
              top: 0,
              left: 0,
            }}
          ></div>,
          document.body
        )}

      {/* Portal copy of the clicked SVG so it stays above the overlay */}
      {aloca && portalRect
        ? createPortal(
            <div
              style={{
                position: "fixed",
                top: portalRect.top + "px",
                left: portalRect.left + "px",
                width: portalRect.width + "px",
                height: portalRect.height + "px",
                // allow interaction with the clicked SVG while overlay is visible
                pointerEvents: "auto",
                zIndex: 6,
              }}
            >
              <svg
                width={portalRect.width}
                height={portalRect.height}
                viewBox={`0 0 ${portalRect.width} ${portalRect.height}`}
                style={{ display: "block" }}
                aria-hidden
              >
                <g>
                  <path d={territorio.d1} fill={computedFill} />
                  {territorio.d2 ? (
                    <path
                      d={territorio.d2}
                      stroke="black"
                      strokeOpacity="0.585271"
                      strokeWidth="2"
                      strokeMiterlimit="4.32165"
                      fill={computedFill}
                    />
                  ) : null}
                </g>

                <g>
                  <circle
                    cx={territorio.cx}
                    cy={territorio.cy}
                    r="13"
                    fill={getDarkerPlayerColor(computedFill)}
                    stroke="#222"
                    strokeWidth="2"
                    filter="drop-shadow(0 1px 4px rgba(0,0,0,0.5))"
                  />
                  <text
                    x={territorio.cx}
                    y={territorio.cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="15"
                    fontFamily="TrajanPro, Arial, sans-serif"
                    fontWeight="bold"
                    fill="#222"
                    style={{
                      pointerEvents: "none",
                      userSelect: "none",
                      paintOrder: "stroke",
                      stroke: "#fff",
                      strokeWidth: "1.5px",
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
                    }}
                  >
                    {alocaNum}
                  </text>
                </g>
                {territorio.nome != "MADAGASCAR" ? (
                  <text
                    x={territorio.x}
                    y={territorio.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="12"
                    fontFamily="TrajanPro, Arial, sans-serif"
                    fontWeight="bold"
                    fill="white"
                    style={{
                      pointerEvents: "none",
                      userSelect: "none",
                      paintOrder: "stroke",
                      stroke: "black",
                      strokeWidth: "2px",
                      filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.6))",
                    }}
                  >
                    {territorio.nome}
                  </text>
                ) : null}
              </svg>
            </div>,
            document.body
          )
        : null}
      {aloca && portalRect
        ? createPortal(
            <AllocateHUD
              AlocarTropa={AlocarTropa}
              alocaNum={alocaNum}
              setAlocaNum={setAlocaNum}
            />,
            document.body
          )
        : null}
    </div>
  );
}
