import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useGameStore } from "../../store/useGameStore";
import { useAllocateStore } from "../../store/useAllocate";
import AllocateHUD from "../AllocateHUD/AllocateHUD";
import AttackHUD from "../AttackHUD/AttackHUD";
import { useGame } from "../../hook/useGame";
import { useAttackStore } from "../../store/useAttackStore";
import { useAttackAnimationStore } from "../../store/useAttackAnimationStore";
import { useMapStore } from "../../store/useMapStore";
import { gameService } from "../../service/gameService";
import { extractTerritoryInfo } from "../../utils/gameState";
import type { GameStateResponseDto } from "../../types/game";
import type { TerritoryInfo } from "../../utils/gameState";
import {
  SouthAmericaList,
  NorthAmericaList,
  EuropeList,
  AsiaList,
  AfricaList,
  OceaniaList,
} from "../../utils/continents";
import "./Territory.module.css";
import { useMovementStore } from "../../store/useMovementStore";
import MoveHUD from "../MoveHUD/MoveHUD";

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
  fronteiras: string[];
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

// Combine all territories from all continents
const ALL_TERRITORIES = [
  ...SouthAmericaList,
  ...NorthAmericaList,
  ...EuropeList,
  ...AsiaList,
  ...AfricaList,
  ...OceaniaList,
];

export default function Territory(territorio: TerritorySVG) {
  const [pais] = useState(false);
  const [aloca, setAloca] = useState(false);
  // exibição principal usa valor do estado do jogo (allocatedArmies)
  const [alocaNum, setAlocaNum] = useState<number>(1);
  const gameStatus = useGameStore.getState().gameStatus;
  const gameHUD = useGameStore.getState().gameHud;
  const setGameHUD = useGameStore.getState().setGameHUD;
  const gameEnded = useGameStore((s) => s.gameEnded);
  const isGameFinished = gameEnded || gameStatus === "FINISHED";

  // Estados de loading para bloquear ações durante requisições
  const [isAttacking, setIsAttacking] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const setAllocating = useAllocateStore.getState().setAllocating;

  const [ataque, setAtaque] = useState(false);
  const [fronteiraDefense, setFronteiraDefense] = useState(false);
  const [fronteiraDefenseMove, setFronteiraDefenseMove] = useState(false);
  const setFronteiras = useAttackStore.getState().setFronteiras;
  const fronteiras = useAttackStore.getState().fronteiras;
  const atacanteId = useAttackStore.getState().atacanteId;
  const defensorId = useAttackStore.getState().defensorId;
  const setAtacanteId = useAttackStore.getState().setAtacanteId;
  const setDefensorId = useAttackStore.getState().setDefensorId;
  const resetAttack = useAttackStore.getState().resetAttack;

  const setMoveCount = useMovementStore.getState().setMoveCount;
  const [movement, setMove] = useState(false);
  const fronteirasMove = useMovementStore.getState().fronteiras;
  const setfronteirasMove = useMovementStore.getState().setFronteiras;
  const sourceTerritoryId = useMovementStore.getState().sourceTerritoryId;
  const targetTerritoryId = useMovementStore.getState().targetTerritoryId;
  const moveCount = useMovementStore.getState().moveCount;
  const setSourceId = useMovementStore.getState().setSourceId;
  const setTargetId = useMovementStore.getState().setTargetId;
  const resetMove = useMovementStore.getState().resetMove;

  // Use lightweight game actions to avoid initializing WebSocket per territory
  const { allocateTroops, attack, move } = useGame();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [portalRect, setPortalRect] = useState<DOMRect | null>(null);
  const [ataqueNum, setAtaqueNum] = useState<number>(1);
  const [moveNum, setMoveNum] = useState<number>(1);

  // pega o mapa de cores do jogo (persistido)
  const territoriesColors = useGameStore((s) => s.territoriesColors);

  useEffect(() => {
    setMoveCount(moveNum);
  }, [moveNum]);

  // Quando este território estiver na lista de fronteiras, ele deve aparecer acima do fundo (overlay)
  useEffect(() => {
    const isBorder = !!fronteiras?.find((f) => f === territorio.nome);
    setFronteiraDefense(isBorder);

    if (isBorder) {
      // Garante que teremos o retângulo para renderizar a cópia em portal acima do overlay
      if (svgRef.current) {
        try {
          setPortalRect(svgRef.current.getBoundingClientRect());
        } catch {
          setPortalRect(null);
        }
      }
    } else {
      // Se não está em fronteira e não estamos em outros overlays, podemos liberar o rect
      if (!aloca && !ataque && !movement) {
        setPortalRect(null);
      }
    }
  }, [fronteiras, territorio.nome, aloca, ataque]);

  useEffect(() => {
    const isBorderMove = !!fronteirasMove?.find((f) => f === territorio.nome);
    setFronteiraDefenseMove(isBorderMove);

    if (isBorderMove) {
      // Garante que teremos o retângulo para renderizar a cópia em portal acima do overlay
      if (svgRef.current) {
        try {
          setPortalRect(svgRef.current.getBoundingClientRect());
        } catch {
          setPortalRect(null);
        }
      }
    } else {
      // Se não está em fronteira e não estamos em outros overlays, podemos liberar o rect
      if (!movement) {
        setPortalRect(null);
      }
    }
  }, [fronteirasMove, territorio.nome, movement]);

  async function AlocarTropa() {
    // Bloqueia múltiplos cliques
    if (isAllocating) {
      console.log("⏳ Alocação já em andamento, aguarde...");
      return;
    }

    setIsAllocating(true);

    // Pega o valor mais recente do store
    const currentUnallocatedArmies =
      useAllocateStore.getState().unallocatedArmies;

    console.log("🎯 AlocarTropa - Estado:", {
      currentUnallocatedArmies,
      alocaNum,
      territorio: territorio.nome,
    });

    if (currentUnallocatedArmies <= 0) {
      alert("Não possui mais soldados para alocar");
      console.warn("❌ Sem tropas para alocar:", currentUnallocatedArmies);
      setIsAllocating(false);
      return;
    }
    const info =
      overrideColor ||
      territoriesColors[normalizedKey] ||
      territoriesColors[rawKey] ||
      territoriesColors[rawKey.toUpperCase?.()];

    const territoryId = info?.id != null ? Number(info.id) : null;

    console.log("🗺️ Territory ID resolvido:", territoryId);

    if (!territoryId) {
      console.warn(
        "Não foi possível resolver o id do território para:",
        territorio.nome
      );
      setAloca(false);
      setAllocating(false);
      setGameHUD("DEFAULT");
      setPortalRect(null);
      setIsAllocating(false);
      return;
    }

    // allocateTroops já pega o gameId internamente do store
    // e se não tiver, busca automaticamente do backend

    try {
      console.log("📤 Enviando alocação:", { territoryId, alocaNum });
      await allocateTroops(territoryId, alocaNum);

      const newValue = currentUnallocatedArmies - alocaNum;
      console.log("✅ Alocação bem-sucedida! Atualizando unallocatedArmies:", {
        antes: currentUnallocatedArmies,
        alocado: alocaNum,
        depois: newValue,
      });

      useAllocateStore.getState().setUnallocatedArmies(newValue);

      // Limpa todos os estados após sucesso
      setAloca(false);
      setAllocating(false);
      setGameHUD("DEFAULT");
      setPortalRect(null);
      setAlocaNum(1); // Reseta o valor de alocação para o valor inicial
    } catch (err) {
      console.error("❌ Erro ao alocar tropas:", err);
      // show a simple user feedback; keep UI open so user can retry
      try {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "response" in err
            ? (err as { response?: { data?: string } }).response?.data
            : "Falha ao alocar tropas. Tente novamente.";
        alert(errorMessage || "Falha ao alocar tropas. Tente novamente.");
      } catch {
        // ignore alert failures in non-browser contexts
      }
      // Em caso de erro, NÃO limpa os estados para permitir retry
    } finally {
      setIsAllocating(false);
    }
  }

  function handleAttackClick(territoryId: number) {
    // 🔒 Bloqueia interação se o jogo terminou
    if (isGameFinished) {
      return;
    }

    console.log(
      "🖱️ Clique em território - ID:",
      territoryId,
      "Nome:",
      territorio.nome
    );
    console.log("🔍 DEBUG overrideColor RAW:", {
      overrideColor,
      allocatedArmie: overrideColor?.allocatedArmie,
      staticArmies_raw: overrideColor?.staticArmies,
      movedInArmies_raw: overrideColor?.movedInArmies,
    });

    if (!atacanteId) {
      console.log("📍 Tentando selecionar ATACANTE");
      console.log("  - Tropas totais:", allocatedArmies);
      console.log("  - Tropas estáticas (podem atacar):", staticArmies);
      console.log("  - Tropas movidas (não podem atacar):", movedInArmies);

      // Se tem tropas movidas (≥1), pode atacar com qualquer quantidade de static
      // Se não tem tropas movidas, precisa de static > 1 (para deixar 1 no território)
      const canAttack =
        movedInArmies >= 1 ? staticArmies >= 1 : staticArmies > 1;

      if (canAttack) {
        console.log("✅ Pode atacar:", {
          staticArmies,
          movedInArmies,
          reason:
            movedInArmies >= 1
              ? "Tem tropas movidas (garantem ocupação)"
              : "Tropas estáticas suficientes (>1)",
        });

        const myId = useGameStore.getState().player?.id;
        const ownerId = overrideColor?.ownerId ?? null;

        console.log("🔍 Validação de OWNERSHIP na seleção:");
        console.log("  - Meu player.id:", myId);
        console.log("  - Owner do território:", ownerId);
        console.log("  - overrideColor completo:", overrideColor);
        console.log("  - Match?:", String(ownerId) === String(myId));

        if (ownerId == null || String(ownerId) !== String(myId)) {
          console.error("❌ Território não pertence ao jogador!");
          alert("Deve selecionar um território dominado por você");
          return;
        }

        console.log(
          "✅ Território confirmado como SEU! Selecionando como atacante..."
        );
        setAtacanteId(territoryId);
        console.log("💾 atacanteId salvo no store:", territoryId);

        // Filtra apenas fronteiras inimigas comparando ownerId com o jogador atual
        const enemyBorders = (territorio.fronteiras || []).filter(
          (borderName) => {
            const info = resolveTerritoryInfoByName(borderName);
            const borderOwnerId = info?.ownerId ?? null;
            return (
              borderOwnerId == null || String(borderOwnerId) !== String(myId)
            );
          }
        );

        console.log("🗡️ Fronteiras inimigas encontradas:", enemyBorders);

        if (enemyBorders.length === 0) {
          alert("Não há territórios inimigos adjacentes para atacar.");
          resetAttack();
          return;
        }
        setFronteiras(enemyBorders);

        setAtaque(true);
      } else {
        console.warn("⚠️ Não pode atacar:", {
          staticArmies,
          movedInArmies,
          reason:
            movedInArmies >= 1
              ? "Precisa de pelo menos 1 static army"
              : "Precisa de mais de 1 static army (para deixar 1 no território)",
        });
        alert(
          movedInArmies >= 1
            ? "Você precisa de pelo menos 1 tropa estática para atacar"
            : "Você precisa de mais de 1 tropa estática para atacar (deve deixar 1 no território)"
        );
        setGameHUD("DEFAULT");
      }
      return;
    }

    // Seleção do defensor (somente se for fronteira)
    if (atacanteId && !defensorId) {
      console.log("📍 Tentando selecionar DEFENSOR");
      const isBorder = fronteiras?.includes?.(territorio.nome);
      console.log("  - É fronteira?:", isBorder);
      console.log("  - Lista de fronteiras:", fronteiras);

      if (isBorder) {
        console.log("✅ Território válido como defensor!");
        setDefensorId(territoryId);
        console.log("💾 defensorId salvo no store:", territoryId);
        setGameHUD("ATTACK");
        // AttackHUD será exibido quando defensorId estiver definido
      } else {
        console.warn("⚠️ Território não é adjacente ao atacante");
      }
      return;
    }
  }

  async function confirmarAtaque() {
    if (!atacanteId || !defensorId) return;

    // Bloqueia múltiplos cliques
    if (isAttacking) {
      console.log("⏳ Ataque já em andamento, aguarde...");
      return;
    }

    setIsAttacking(true);

    // 🔍 VALIDAÇÃO: Verificar se o território atacante realmente pertence ao jogador
    const myId = useGameStore.getState().player?.id;
    let territoriesColors = useGameStore.getState().territoriesColors;

    console.log("🔍 ===== DEBUG COMPLETO DO ATAQUE =====");
    console.log("📊 Meu ID de jogador:", myId);
    console.log("⚔️ Território Atacante ID:", atacanteId);
    console.log("🛡️ Território Defensor ID:", defensorId);
    console.log("🎲 Número de dados:", ataqueNum);
    console.log(
      "🗺️ Mapa completo de territórios (territoriesColors):",
      territoriesColors
    );

    // 🔄 ATUALIZAÇÃO: Buscar estado mais recente do jogo antes de atacar
    console.log("🔄 Buscando estado atualizado do jogo...");
    try {
      const currentGame = await gameService.getCurrentGame();
      if (currentGame && currentGame.gameTerritories) {
        console.log("✅ Estado do jogo atualizado recebido:", currentGame);
        const updatedColors = extractTerritoryInfo(
          currentGame as GameStateResponseDto
        );
        useGameStore.getState().setTerritoriesColors(updatedColors);
        territoriesColors = updatedColors;
        setGameHUD("DEFAULT");
        console.log("🆕 Mapa de territórios atualizado:", territoriesColors);
      }
    } catch {
      console.warn(
        "⚠️ Não foi possível atualizar o estado do jogo, continuando com dados locais"
      );
    }

    // Encontrar informações do território atacante no mapa
    let atacanteInfo = null;
    let atacanteKey = null;

    for (const [key, value] of Object.entries(territoriesColors)) {
      if (value.id === atacanteId) {
        atacanteInfo = value;
        atacanteKey = key;
        break;
      }
    }

    console.log("🗺️ Informações do atacante encontradas:");
    console.log("  - Chave:", atacanteKey);
    console.log("  - Info completa:", atacanteInfo);
    console.log("  - Owner ID:", atacanteInfo?.ownerId);
    console.log("  - É meu?:", atacanteInfo?.ownerId === myId);

    // Validação CRÍTICA antes de enviar ao backend
    if (!atacanteInfo) {
      console.error("❌ ERRO: Território atacante não encontrado no mapa!");
      alert("Erro: Território atacante não identificado. Tente novamente.");
      resetAttack();
      setAtaque(false);
      setIsAttacking(false);
      return;
    }

    if (atacanteInfo.ownerId !== myId) {
      console.error("❌ ERRO DE OWNERSHIP:");
      console.error("  - Owner real do território:", atacanteInfo.ownerId);
      console.error("  - Meu ID:", myId);
      console.error("  - Território:", atacanteKey);
      alert(
        `Este território não pertence a você!\nDono: ${atacanteInfo.ownerId}, Você: ${myId}`
      );
      resetAttack();
      setAtaque(false);
      setIsAttacking(false);
      return;
    }

    console.log(
      "✅ Validação OK! Território pertence ao jogador. Enviando ataque..."
    );

    // 🎬 Trigger attack animation
    console.log("🎬 ========== STARTING ATTACK ANIMATION SETUP ==========");
    console.log("🎬 IDs:", { atacanteId, defensorId });
    console.log("🎬 Attacker key:", atacanteKey);

    try {
      // Find defender territory info
      let defensorInfo = null;
      let defensorKey = null;

      console.log("🔍 Searching for defender in territoriesColors...");
      for (const [key, value] of Object.entries(territoriesColors)) {
        if (value.id === defensorId) {
          defensorInfo = value;
          defensorKey = key;
          console.log("✅ Defender found:", { key, value });
          break;
        }
      }

      console.log("🔍 Defender search result:", { defensorInfo, defensorKey });

      if (defensorInfo && defensorKey) {
        console.log("🔍 Searching for SVG data...");
        console.log("🔍 ALL_TERRITORIES count:", ALL_TERRITORIES.length);
        console.log("🔍 Looking for atacante:", atacanteKey);
        console.log("🔍 Looking for defensor:", defensorKey);

        // Helper function to normalize territory names for comparison
        const normalizeForComparison = (name: string) => {
          return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/\s+/g, ""); // Remove espaços
        };

        // Find SVG data for both territories by their normalized names
        const atacanteSVG = ALL_TERRITORIES.find(
          (t) =>
            normalizeForComparison(t.nome) ===
            normalizeForComparison(atacanteKey || "")
        );
        const defensorSVG = ALL_TERRITORIES.find(
          (t) =>
            normalizeForComparison(t.nome) ===
            normalizeForComparison(defensorKey)
        );

        console.log("🔍 SVG search result:", {
          atacanteSVG: atacanteSVG ? atacanteSVG.nome : null,
          defensorSVG: defensorSVG ? defensorSVG.nome : null,
        });

        if (atacanteSVG && defensorSVG) {
          // Convert cx/cy strings to numbers and ADD to x/y base position
          const startPos = {
            x: parseFloat(atacanteSVG.x) + parseFloat(atacanteSVG.cx),
            y: parseFloat(atacanteSVG.y) + parseFloat(atacanteSVG.cy),
          };
          const endPos = {
            x: parseFloat(defensorSVG.x) + parseFloat(defensorSVG.cx),
            y: parseFloat(defensorSVG.y) + parseFloat(defensorSVG.cy),
          };

          console.log("📍 Positions extracted:", { startPos, endPos });

          // Get current map transform
          const mapTransform = useMapStore.getState();

          console.log("🗺️ Map transform:", mapTransform);

          // Trigger animation with map transform
          console.log("🚀 Calling startAttackAnimation...");
          useAttackAnimationStore
            .getState()
            .startAttackAnimation(startPos, endPos, {
              x: mapTransform.position.x,
              y: mapTransform.position.y,
              zoom: mapTransform.zoom,
            });
          console.log("🎬 ✅ Animation triggered successfully!");
        } else {
          console.warn("⚠️ SVG data not found for animation:", {
            atacanteSVG: !!atacanteSVG,
            defensorSVG: !!defensorSVG,
          });
        }
      } else {
        console.warn("⚠️ Defender info not found:", {
          defensorId,
          defensorInfo,
          defensorKey,
        });
      }
    } catch (animError) {
      console.warn("⚠️ Failed to trigger animation:", animError);
      // Continue with attack even if animation fails
    }

    try {
      await attack(atacanteId, defensorId, ataqueNum);
      // Após enviar o ataque, limpa seleção e fecha overlay/HUD
      setAtaque(false);
      resetAttack();
      setFronteiraDefense(false);
    } catch {
      // erro já tratado no hook; mantém HUD aberto para tentar novamente
    } finally {
      setIsAttacking(false);
    }
  }

  function cancelarAtaque() {
    resetAttack();
    setGameHUD("DEFAULT");
    setAtaque(false);
  }

  function handleMoveClick(territoryId: number) {
    if (isGameFinished) {
      return;
    }

    console.log(
      "🖱️ Clique em território - ID:",
      territoryId,
      "Nome:",
      territorio.nome
    );

    if (!sourceTerritoryId) {
      console.log("📍 Tentando selecionar Origin");
      console.log("  - Tropas totais:", allocatedArmies);
      console.log("  - Tropas estáticas (podem atacar):", staticArmies);
      console.log("  - Tropas movidas (não podem atacar):", movedInArmies);

      // Se tem tropas movidas (≥1), pode atacar com qualquer quantidade de static
      // Se não tem tropas movidas, precisa de static > 1 (para deixar 1 no território)
      const canMove = movedInArmies >= 1 ? staticArmies >= 1 : staticArmies > 1;

      if (canMove) {
        console.log("✅ Pode atacar:", {
          staticArmies,
          movedInArmies,
          reason:
            movedInArmies >= 1
              ? "Tem tropas movidas (garantem ocupação)"
              : "Tropas estáticas suficientes (>1)",
        });

        const myId = useGameStore.getState().player?.id;
        const ownerId = overrideColor?.ownerId ?? null;

        console.log("🔍 Validação de OWNERSHIP na seleção:");
        console.log("  - Meu player.id:", myId);
        console.log("  - Owner do território:", ownerId);
        console.log("  - overrideColor completo:", overrideColor);
        console.log("  - Match?:", String(ownerId) === String(myId));

        if (ownerId == null || String(ownerId) !== String(myId)) {
          console.error("❌ Território não pertence ao jogador!");
          alert("Deve selecionar um território dominado por você");
          return;
        }

        console.log(
          "✅ Território confirmado como SEU! Selecionando como atacante..."
        );
        setSourceId(territoryId);
        console.log("💾 sourceId salvo no store:", territoryId);

        // Filtra apenas fronteiras inimigas comparando ownerId com o jogador atual
        const allyBorders = (territorio.fronteiras || []).filter(
          (borderName) => {
            const info = resolveTerritoryInfoByName(borderName);
            const borderOwnerId = info?.ownerId ?? null;
            return (
              borderOwnerId == null || String(borderOwnerId) == String(myId)
            );
          }
        );

        console.log("🗡️ Fronteiras aliadas encontradas:", allyBorders);

        if (allyBorders.length === 0) {
          alert("Não há territórios aliados adjacentes para mover.");
          resetMove();
          return;
        }
        setfronteirasMove(allyBorders);
        setMove(true);
      } else {
        console.warn("⚠️ Não pode mover:", {
          staticArmies,
          movedInArmies,
          reason:
            movedInArmies >= 1
              ? "Precisa de pelo menos 1 static army"
              : "Precisa de mais de 1 static army (para deixar 1 no território)",
        });
        alert(
          movedInArmies >= 1
            ? "Você precisa de pelo menos 1 tropa estática para atacar"
            : "Você precisa de mais de 1 tropa estática para atacar (deve deixar 1 no território)"
        );
        setGameHUD("DEFAULT");
      }
      return;
    }

    if (sourceTerritoryId && !targetTerritoryId) {
      console.log("📍 Tentando selecionar alvo para mover");
      const isBorder = fronteirasMove?.includes?.(territorio.nome);
      console.log("  - É fronteira?:", isBorder);
      console.log("  - Lista de fronteiras:", fronteirasMove);

      if (isBorder) {
        console.log("✅ Território válido como destino!");
        setTargetId(territoryId);
        console.log("💾 defensorId salvo no store:", territoryId);
        setGameHUD("MOVEMENT");
        // AttackHUD será exibido quando defensorId estiver definido
      } else {
        console.warn("⚠️ Território não é adjacente ao atacante");
      }
      return;
    }
  }

  async function confirmarMove() {
    if (!sourceTerritoryId || !targetTerritoryId) return;
    console.log("chegoun aquo");
    console.log(isMoving);
    // Bloqueia múltiplos cliques
    if (isMoving) {
      console.log("⏳ Movimento já em andamento, aguarde...");
      return;
    }

    setIsMoving(true);

    // 🔍 VALIDAÇÃO: Verificar se o território atacante realmente pertence ao jogador
    const myId = useGameStore.getState().player?.id;
    let territoriesColors = useGameStore.getState().territoriesColors;
    if (!moveCount) {
      setMoveCount(moveNum);
    }

    console.log("🔍 ===== DEBUG COMPLETO DO MOVIMENTO =====");
    console.log("📊 Meu ID de jogador:", myId);
    console.log("⚔️ Território Origem ID:", sourceTerritoryId);
    console.log("🛡️ Território Destino ID:", targetTerritoryId);
    console.log("🎲 Número de soldados:", moveCount);
    console.log(
      "🗺️ Mapa completo de territórios (territoriesColors):",
      territoriesColors
    );

    // 🔄 ATUALIZAÇÃO: Buscar estado mais recente do jogo antes de atacar
    console.log("🔄 Buscando estado atualizado do jogo...");
    try {
      const currentGame = await gameService.getCurrentGame();
      if (currentGame && currentGame.gameTerritories) {
        console.log("✅ Estado do jogo atualizado recebido:", currentGame);
        const updatedColors = extractTerritoryInfo(
          currentGame as GameStateResponseDto
        );
        useGameStore.getState().setTerritoriesColors(updatedColors);
        territoriesColors = updatedColors;
        console.log("🆕 Mapa de territórios atualizado:", territoriesColors);
      }
    } catch {
      console.warn(
        "⚠️ Não foi possível atualizar o estado do jogo, continuando com dados locais"
      );
    }

    // Encontrar informações do território atacante no mapa
    let origemInfo = null;
    let originKey = null;

    for (const [key, value] of Object.entries(territoriesColors)) {
      if (value.id === sourceTerritoryId) {
        origemInfo = value;
        originKey = key;
        break;
      }
    }

    console.log("🗺️ Informações da origem encontradas:");
    console.log("  - Chave:", originKey);
    console.log("  - Info completa:", origemInfo);
    console.log("  - Owner ID:", origemInfo?.ownerId);
    console.log("  - É meu?:", origemInfo?.ownerId === myId);

    // Validação CRÍTICA antes de enviar ao backend
    if (!origemInfo) {
      console.error("❌ ERRO: Território origem não encontrado no mapa!");
      alert("Erro: Território origem não identificado. Tente novamente.");
      resetMove();
      setGameHUD("DEFAULT");
      setAtaque(false);
      setIsAttacking(false);
      return;
    }

    if (origemInfo.ownerId !== myId) {
      console.error("❌ ERRO DE OWNERSHIP:");
      console.error("  - Owner real do território:", origemInfo.ownerId);
      console.error("  - Meu ID:", myId);
      console.error("  - Território:", originKey);
      alert(
        `Este território não pertence a você!\nDono: ${origemInfo.ownerId}, Você: ${myId}`
      );
      resetAttack();
      setAtaque(false);
      setIsAttacking(false);
      setGameHUD("DEFAULT");
      return;
    }

    console.log(
      "✅ Validação OK! Território pertence ao jogador. Enviando movimentação..."
    );

    // 🎬 Trigger attack animation
    console.log("🎬 ========== STARTING ATTACK ANIMATION SETUP ==========");
    console.log("🎬 IDs:", { atacanteId, defensorId });
    console.log("🎬 Move key:", originKey);

    try {
      // Find defender territory info
      let destinoInfo = null;
      let destinoKey = null;

      console.log("🔍 Searching for origin in territoriesColors...");
      for (const [key, value] of Object.entries(territoriesColors)) {
        if (value.id === targetTerritoryId) {
          destinoInfo = value;
          destinoKey = key;
          console.log("✅ Origin found:", { key, value });
          break;
        }
      }

      console.log("🔍 Origin search result:", { destinoInfo, destinoKey });

      if (destinoInfo && destinoKey) {
        console.log("🔍 Searching for SVG data...");
        console.log("🔍 ALL_TERRITORIES count:", ALL_TERRITORIES.length);
        console.log("🔍 Looking for origin:", originKey);
        console.log("🔍 Looking for destiny:", destinoKey);

        // Helper function to normalize territory names for comparison
        const normalizeForComparison = (name: string) => {
          return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/\s+/g, ""); // Remove espaços
        };

        // Find SVG data for both territories by their normalized names
        const atacanteSVG = ALL_TERRITORIES.find(
          (t) =>
            normalizeForComparison(t.nome) ===
            normalizeForComparison(originKey || "")
        );
        const defensorSVG = ALL_TERRITORIES.find(
          (t) =>
            normalizeForComparison(t.nome) ===
            normalizeForComparison(destinoKey)
        );

        console.log("🔍 SVG search result:", {
          atacanteSVG: atacanteSVG ? atacanteSVG.nome : null,
          defensorSVG: defensorSVG ? defensorSVG.nome : null,
        });

        if (atacanteSVG && defensorSVG) {
          // Convert cx/cy strings to numbers and ADD to x/y base position
          const startPos = {
            x: parseFloat(atacanteSVG.x) + parseFloat(atacanteSVG.cx),
            y: parseFloat(atacanteSVG.y) + parseFloat(atacanteSVG.cy),
          };
          const endPos = {
            x: parseFloat(defensorSVG.x) + parseFloat(defensorSVG.cx),
            y: parseFloat(defensorSVG.y) + parseFloat(defensorSVG.cy),
          };

          console.log("📍 Positions extracted:", { startPos, endPos });

          // Get current map transform
          const mapTransform = useMapStore.getState();

          console.log("🗺️ Map transform:", mapTransform);

          // Trigger animation with map transform
          console.log("🚀 Calling startAttackAnimation...");
          useAttackAnimationStore
            .getState()
            .startAttackAnimation(startPos, endPos, {
              x: mapTransform.position.x,
              y: mapTransform.position.y,
              zoom: mapTransform.zoom,
            });
          console.log("🎬 ✅ Animation triggered successfully!");
        } else {
          console.warn("⚠️ SVG data not found for animation:", {
            atacanteSVG: !!atacanteSVG,
            defensorSVG: !!defensorSVG,
          });
        }
      } else {
        console.warn("⚠️ destiny info not found:", {
          defensorId,
          destinoInfo,
          destinoKey,
        });
      }
    } catch (animError) {
      console.warn("⚠️ Failed to trigger animation:", animError);
      // Continue with attack even if animation fails
    }

    try {
      if (!moveCount) {
        return;
      }
      await move(sourceTerritoryId, targetTerritoryId, moveCount);
      // Após enviar o ataque, limpa seleção e fecha overlay/HUD
      setMove(false);
      resetMove();
      setFronteiraDefense(false);
      setMoveNum(1);
      setIsMoving(false);
    } catch {
      // erro já tratado no hook; mantém HUD aberto para tentar novamente
    } finally {
      setIsAttacking(false);
    }
  }

  function cancelarMove() {
    resetMove();
    setGameHUD("DEFAULT");
    setMove(false);
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
  const getFillColor = (fill: string | TerritoryInfo | null): string =>
    typeof fill === "string"
      ? fill
      : fill && typeof fill === "object" && typeof fill.color === "string"
      ? fill.color
      : territorio.corEscura;

  const computedFill = getFillColor(
    overrideColor
      ? overrideColor
      : pais
      ? territorio.corClara
      : territorio.corEscura
  );

  // Valor atual de exército alocado vindo do estado do jogo (mapa de territoriesColors)
  const allocatedArmies = useMemo(() => {
    if (!overrideColor?.allocatedArmie) return 0;
    const n = Number(overrideColor.allocatedArmie);
    return Number.isFinite(n) ? n : 0;
  }, [overrideColor]);

  // Tropas estáticas (que podem atacar)
  const staticArmies = useMemo(() => {
    if (!overrideColor?.staticArmies) return 0;
    const n = Number(overrideColor.staticArmies);
    return Number.isFinite(n) ? n : 0;
  }, [overrideColor]);

  // Tropas movidas (que NÃO podem atacar)
  const movedInArmies = useMemo(() => {
    if (!overrideColor?.movedInArmies) return 0;
    const n = Number(overrideColor.movedInArmies);
    return Number.isFinite(n) ? n : 0;
  }, [overrideColor]);

  // Tropas disponíveis para USAR NO ATAQUE
  // Se tem movedInArmies ≥ 1: pode usar TODAS as staticArmies
  // Se não tem movedInArmies: pode usar staticArmies - 1 (precisa deixar 1)
  const availableForAttack = useMemo(() => {
    if (movedInArmies >= 1) {
      return staticArmies; // Pode usar todas
    }
    return Math.max(0, staticArmies - 1); // Precisa deixar 1 no território
  }, [staticArmies, movedInArmies]);

  // Verifica se este território é o atacante ou defensor selecionado
  // IMPORTANTE: Deve vir DEPOIS de overrideColor ser definido
  const myTerritoryId = getId();
  const isAttacker = atacanteId != null && myTerritoryId === atacanteId;
  const isDefender = defensorId != null && myTerritoryId === defensorId;
  const isBattleParticipant = isAttacker || isDefender;
  const bothSelected = atacanteId != null && defensorId != null;

  // Resolve informações do território a partir do nome usando a mesma estratégia de normalização
  function resolveTerritoryInfoByName(name: string): TerritoryInfo | undefined {
    const keyRaw = (name && String(name).trim()) || "";
    const keyNorm = normalize(keyRaw);
    if (territoriesColors[keyNorm]) return territoriesColors[keyNorm];
    if (territoriesColors[keyRaw]) return territoriesColors[keyRaw];
    const keyUpper = keyRaw.toUpperCase();
    if (keyUpper && territoriesColors[keyUpper])
      return territoriesColors[keyUpper];

    for (const k in territoriesColors) {
      const kn = normalize(k);
      if (kn === keyNorm) return territoriesColors[k];
      if (kn.includes(keyNorm) || keyNorm.includes(kn))
        return territoriesColors[k];
    }
    return undefined;
  }

  function getId(): number | null {
    // Resolve o id do território deste componente usando o mapa persistido
    const info: TerritoryInfo | null =
      (overrideColor && typeof overrideColor === "object"
        ? (overrideColor as TerritoryInfo)
        : territoriesColors[normalizedKey] ||
          territoriesColors[rawKey] ||
          territoriesColors[rawKey.toUpperCase()]) || null;

    const territoryId = info?.id != null ? Number(info.id) : null;

    return Number.isFinite(territoryId as number)
      ? (territoryId as number)
      : null;
  }

  function Alocar() {
    // 🔒 Bloqueia interação se o jogo terminou
    if (isGameFinished) {
      return;
    }

    // Verifica se é o turno do jogador
    const isMyTurn = useGameStore.getState().isMyTurn;
    if (!isMyTurn) {
      console.log("❌ Não é seu turno, alocação bloqueada");
      return;
    }

    // Verifica se está na fase de alocação
    if (gameStatus !== "REINFORCEMENT" && gameStatus !== "SETUP_ALLOCATION") {
      console.log("❌ Não está na fase de alocação, bloqueado");
      return;
    }

    const ownerId = overrideColor?.ownerId ?? null;
    const myId = useGameStore.getState().player?.id;
    console.log(myId);

    if (ownerId != null && String(ownerId) == String(myId)) {
      setGameHUD("ALLOCATION");

      if (svgRef.current) {
        try {
          setPortalRect(svgRef.current.getBoundingClientRect());
        } catch {
          setPortalRect(null);
        }
      }
      setAloca(true);
      setAllocating(true);
    } else {
      console.log("❌ Território não pertence ao jogador");
    }
  }

  return (
    <div>
      <div style={{ zIndex: 44 }}>
        
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
            zIndex: 44,
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
                } catch {
                  setPortalRect(null);
                }
              }
              if (
                gameStatus == "REINFORCEMENT" ||
                gameStatus == "SETUP_ALLOCATION"
              ) {
                Alocar();
              } else if (gameStatus == "ATTACK") {
                const id = getId();
                console.log("id:", id);
                if (id != null) handleAttackClick(id);
              } else if (gameStatus == "MOVEMENT") {
                const id = getId();
                console.log("id:", id);
                if (id != null) handleMoveClick(id);
              }
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

            {/* Destaque quando ambos territórios estão selecionados */}
            {bothSelected && isBattleParticipant && (
              <>
                <path
                  d={territorio.d1}
                  fill="none"
                  stroke={isAttacker ? "#FFD700" : "#FF4444"}
                  strokeWidth="4"
                  strokeDasharray="10,5"
                  opacity="0.8"
                  style={{
                    animation: "pulse 1.5s ease-in-out infinite",
                    filter: "drop-shadow(0 0 8px currentColor)",
                  }}
                />
                {territorio.d2 && (
                  <path
                    d={territorio.d2}
                    fill="none"
                    stroke={isAttacker ? "#FFD700" : "#FF4444"}
                    strokeWidth="4"
                    strokeDasharray="10,5"
                    opacity="0.8"
                    style={{
                      animation: "pulse 1.5s ease-in-out infinite",
                      filter: "drop-shadow(0 0 8px currentColor)",
                    }}
                  />
                )}
              </>
            )}
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
              {allocatedArmies}
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
              resetAttack();
              setGameHUD("DEFAULT");
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

      {/* Overlay de ataque */}
      {(ataque || movement) &&
        createPortal(
          <div
            onClick={() => {
              setAtaque(false);
              resetAttack();
              setFronteiraDefense(false);
              setMove(false);
              resetMove();
              setGameHUD("DEFAULT");
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
      {(aloca ||
        ataque ||
        movement ||
        fronteiraDefense ||
        fronteiraDefenseMove) &&
      portalRect
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
                zIndex: 44,
              }}
            >
              
              <svg
                width={portalRect.width}
                height={portalRect.height}
                viewBox={`0 0 ${portalRect.width} ${portalRect.height}`}
                style={{ display: "block", cursor: "pointer" }}
                onClick={() => {
                  const id = getId();
                  if (id == null) return;
                  if (gameStatus === "ATTACK") {
                    handleAttackClick(id);
                  } else if (gameStatus === "MOVEMENT") {
                    handleMoveClick(id);
                  }
                }}
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

                  {/* Destaque quando ambos territórios estão selecionados (Portal) */}
                  {bothSelected && isBattleParticipant && (
                    <>
                      <path
                        d={territorio.d1}
                        fill="none"
                        stroke={isAttacker ? "#FFD700" : "#FF4444"}
                        strokeWidth="4"
                        strokeDasharray="10,5"
                        opacity="0.8"
                        style={{
                          animation: "pulse 1.5s ease-in-out infinite",
                          filter: "drop-shadow(0 0 8px currentColor)",
                        }}
                      />
                      {territorio.d2 && (
                        <path
                          d={territorio.d2}
                          fill="none"
                          stroke={isAttacker ? "#FFD700" : "#FF4444"}
                          strokeWidth="4"
                          strokeDasharray="10,5"
                          opacity="0.8"
                          style={{
                            animation: "pulse 1.5s ease-in-out infinite",
                            filter: "drop-shadow(0 0 8px currentColor)",
                          }}
                        />
                      )}
                    </>
                  )}
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
                    {allocatedArmies}
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
      {/* Attack HUD: renderiza apenas no território atacante selecionado e quando já há defensor */}
      {gameHUD === "ATTACK" && atacanteId != null && getId() === atacanteId
        ? createPortal(
            <AttackHUD
              allocatedArmies={availableForAttack}
              ataqueNum={ataqueNum}
              setAtaqueNum={setAtaqueNum}
              Atacar={confirmarAtaque}
              cancelarAtaque={cancelarAtaque}
              isLoading={isAttacking}
            />,
            document.body
          )
        : null}
      {gameHUD === "MOVEMENT" &&
      sourceTerritoryId != null &&
      getId() === sourceTerritoryId
        ? createPortal(
            <MoveHUD
              allocatedArmies={availableForAttack}
              Mover={confirmarMove}
              cancelarMove={cancelarMove}
              moveNum={moveNum}
              setMoveNum={setMoveNum}
            />,
            document.body
          )
        : null}
      {gameHUD == "ALLOCATION" && portalRect
        ? createPortal(
            <AllocateHUD
              AlocarTropa={AlocarTropa}
              alocaNum={alocaNum}
              setAlocaNum={setAlocaNum}
              isLoading={isAllocating}
              onClose={() => {
                setGameHUD("DEFAULT");
                setAloca(false);
                setAllocating(false);
                setPortalRect(null);
              }}
            />,
            document.body
          )
        : null}
    </div>
  );
}
