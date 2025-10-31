export interface GameStateResponseDto {
  id: number;
  status: string; // Ex.: "LOBBY" | "RUNNING" | "FINISHED"
  createdAt: string; // JSON vem como string ISO; parse para Date se necessário
  name: string;
  turnPlayer?: PlayerGameDto | null;
  winner?: PlayerGameDto | null;
  cardSetExchangeCount: number;
  playerGames: PlayerGameDto[];
  gameTerritories: GameTerritoryDto[];
}

 export interface ObjectiveDto {
  id: number;
  description: string;
  type: string; // pode ser especializado conforme backend (ex.: "ELIMINATE" | "DOMINATE")
}

export interface GameTerritoryDto {
  id: number;
  territory: Territory; // nome do território (usar como chave para pintura)
  ownerId: number; // relaciona com PlayerGameDto.id
  staticArmies: number;
  movedInArmies: number;
  unallocatedArmies: number;
}

export interface Territory {
  id: number;
  name: string;
  continent: string;
}

export interface TerritoryDto {
  id: number;
  name: string;
  continent: string;
}

 export type gameHUD = "DEFAULT" | "ALLOCATION" | "ATTACK";
