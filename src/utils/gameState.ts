import { useAuthStore } from "../store/useAuthStore";
import { useGameStore } from "../store/useGameStore";
import type { GameStateResponseDto, GameTerritoryDto } from "../types/game";

// Using global ambient DTO interfaces declared in src/types/*.d.ts

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
// Retorna um mapa: nome normalizado do território => { color, id, owne
): Record<string, { color: string; id: number; ownerId: number | null , allocatedArmie:number}> {
  const players: PlayerGameDto[] = state.playerGames || [];
  const territories: GameTerritoryDto[] = state.gameTerritories || [];

  const info: Record<string, { color: string; id: number; ownerId: number | null, allocatedArmie:number }> = {};

  for (const t of territories) {
    const name = t.territory.name ?? "";
    const key = normalize(name);
    const owner = players.find((p) => Number(p.id) === Number(t.ownerId));
    const color =
      owner?.color ||
      (owner?.player?.username && fallbackColor(String(owner.player.username))) ||
      fallbackColor(String(t.ownerId ?? name));
    const ownerId = t.ownerId != null ? Number(t.ownerId) : null;
    
    // ✅ CORREÇÃO: Usar t.territory.id (ID fixo do território) em vez de t.id (GameTerritory.id único por partida)
    const territoryId = Number(t.territory.id);
    
    info[key] = { 
      color, 
      id: territoryId,  // ✅ AGORA USA Territory.id (1-42) em vez de GameTerritory.id
      ownerId, 
      allocatedArmie: t.staticArmies
    };
  }
  console.log("info final:",info)
  return info;
}
export function extractPlayerObjectives(state: GameStateResponseDto): string {
  // Return the objective description for the currently authenticated user.
  const authId = useAuthStore.getState().getUserId?.();
  if (!authId) return "";

  const players: PlayerGameDto[] = state.playerGames || [];
  const pg = players.find((p) => String(p.id) === String(authId));
  return pg?.objective?.description ?? "";
}

// Extract objective for a specific player id and store it in the game store
export function extractAndStorePlayerObjective(state: GameStateResponseDto, playerId: string): string {
  const players: PlayerGameDto[] = state.playerGames || [];
  const pg = players.find((p) => String(p.id) === String(playerId));
  const obj = pg?.objective?.description ?? "";
  // persist into game store for UI consumption
  useGameStore.getState().setPlayerObjective({ id: Number(playerId), objective: obj });
  return obj;
}
