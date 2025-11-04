import { useAuthStore } from "../store/useAuthStore";
import { useGameStore } from "../store/useGameStore";
import type { GameStateResponseDto, GameTerritoryDto } from "../types/game";

export interface TerritoryInfo {
  color: string;
  id: number;
  ownerId: number | null;
  allocatedArmie: number;
  staticArmies: number;
  movedInArmies: number;
}

// Mapeamento de nomes em português (SVG) para nomes em inglês/maiúsculas (Backend)
const TERRITORY_NAME_MAP: Record<string, string> = {
  // América do Norte
  "alaska": "ALASKA",
  "mackenzie": "MACKENZIE",
  "vancouver": "VANCOUVER",
  "ottawa": "OTTAWA",
  "labrador": "LABRADOR",
  "california": "CALIFÓRNIA",
  "nova york": "NOVA YORK",
  "mexico": "MÉXICO",
  "groenlandia": "GROENLÂNDIA",
  
  // América do Sul
  "venezuela": "VENEZUELA",
  "brasil": "BRASIL",
  "bolivia": "BOLÍVIA",
  "argentina": "ARGENTINA",
  
  // Europa
  "islandia": "ISLÂNDIA",
  "inglaterra": "INGLATERRA",
  "suecia": "SUÉCIA",
  "polonia": "POLÔNIA",
  "italia": "ITÁLIA",
  "espanha": "ESPANHA",
  "moscou": "MOSCOU",
  
  // África
  "egito": "EGITO",
  "nigeria": "NIGÉRIA",
  "sudao": "SUDÃO",
  "congo": "CONGO",
  "africa do sul": "ÁFRICA DO SUL",
  "madagascar": "MADAGASCAR",
  
  // Ásia
  "omsk": "OMSK",
  "dudinka": "DUDINKA",
  "siberia": "SIBÉRIA",
  "vladivostok": "VLADIVOSTOK",
  "tchita": "TCHITA",
  "mongolia": "MONGÓLIA",
  "japao": "JAPÃO",
  "aral": "ARAL",
  "china": "CHINA",
  "india": "ÍNDIA",
  "vietna": "VIETNÃ",
  "oriente medio": "ORIENTE MÉDIO",
  
  // Oceania
  "australia": "AUSTRÁLIA",
  "sumatra": "SUMATRA",
  "borneo": "BORNEO",
  "nova guine": "NOVA GUINÉ"
};

// Normaliza chave de território por nome (sem acentos, caixa baixa)
const normalize = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

// Converte nome do SVG (português) para nome do backend (inglês/maiúsculas)
export function mapSVGNameToBackendName(svgName: string): string {
  const normalizedKey = normalize(svgName);
  return TERRITORY_NAME_MAP[normalizedKey] || svgName;
}

// Determina uma cor fallback determinística a partir de um identificador
const fallbackColor = (identifier: string) => {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) hash = (hash << 5) - hash + identifier.charCodeAt(i);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 45%)`;
};


export function extractTerritoryInfo(
  state: GameStateResponseDto
): Record<string, TerritoryInfo> {
  const players: PlayerGameDto[] = state.playerGames || [];
  const territories: GameTerritoryDto[] = state.gameTerritories || [];

  const info: Record<string, TerritoryInfo> = {};

  for (const t of territories) {
    const name = t.territory.name ?? "";
    const key = normalize(name);
    const owner = players.find((p) => Number(p.id) === Number(t.ownerId));
    const color =
      owner?.color ||
      (owner?.player?.username && fallbackColor(String(owner.player.username))) ||
      fallbackColor(String(t.ownerId ?? name));
    const ownerId = t.ownerId != null ? Number(t.ownerId) : null;
    const territoryId = Number(t.territory.id);
    const totalArmies = (t.staticArmies || 0) + (t.movedInArmies || 0);
    
    // Log detalhado para debug
    if (name.toLowerCase().includes("brasil")) {
      console.log("🔍 DEBUG extractTerritoryInfo - BRASIL:", {
        name,
        staticArmies_backend: t.staticArmies,
        movedInArmies_backend: t.movedInArmies,
        totalArmies_calculated: totalArmies,
        rawTerritory: t
      });
    }
    
    info[key] = { 
      color, 
      id: territoryId,
      ownerId, 
      allocatedArmie: totalArmies,
      staticArmies: t.staticArmies || 0,
      movedInArmies: t.movedInArmies || 0
    };
  }

  return info;
}
export function extractPlayerObjectives(state: GameStateResponseDto): string {
  const authId = useAuthStore.getState().getUserId?.();
  if (!authId) return "";

  const players: PlayerGameDto[] = state.playerGames || [];
  const pg = players.find((p) => String(p.id) === String(authId));
  return pg?.objective?.description ?? "";
}

export function extractAndStorePlayerObjective(state: GameStateResponseDto, playerId: string): string {
  const players: PlayerGameDto[] = state.playerGames || [];
  const pg = players.find((p) => String(p.id) === String(playerId));
  const obj = pg?.objective?.description ?? "";
  
  useGameStore.getState().setPlayerObjective({ id: Number(playerId), objective: obj });
  return obj;
}
