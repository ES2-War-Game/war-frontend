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


// Retorna um mapa: nome normalizado do território => { color, id }
export function extractTerritoryInfo(state: GameStateResponseDto): Record<string, { color: string; id: number }> {
  const players: PlayerGameDto[] = state.playerGames || [];
  const territories: GameTerritoryDto[] = state.gameTerritories || [];

  const info: Record<string, { color: string; id: number }> = {};

  for (const t of territories) {
    const name = t.territory.name ?? "";
    const key = normalize(name);
    const owner = players.find((p) => Number(p.id) === Number(t.ownerId));
    const color =
      owner?.color ||
      (owner?.player?.username && fallbackColor(String(owner.player.username))) ||
      fallbackColor(String(t.ownerId ?? name));
    info[key] = { color, id: Number(t.id) };
  }

  return info;
}

export function extractPlayerObjectives(state: GameStateResponseDto): Record<string, string> {
  const players: PlayerGameDto[] = state.playerGames || [];
  const map: Record<string, string> = {};

  for (const pg of players) {
    const pid = String(pg.id);
    const obj = pg.objective?.description ?? "";
    map[pid] = obj;
  }

  return map;
}
