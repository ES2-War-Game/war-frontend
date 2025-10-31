import { useAuthStore } from "../store/useAuthStore";
import { useGameStore } from "../store/useGameStore";
import type { GameStateResponseDto, GameTerritoryDto } from "../types/game";

// Using global ambient DTO interfaces declared in src/types/*.d.ts

// Normaliza chave de território por nome (sem acentos, caixa baixa)
const normalize = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

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
    info[key] = { color, id: Number(t.territory.id), ownerId , allocatedArmie: t.staticArmies};
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
