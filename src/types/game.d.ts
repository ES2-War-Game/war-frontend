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

export interface attackResultDice{
  attackResult: number | null;
  defenseResult: number | null;
  defenderDiceCount: number | null;
  attackDiceCount: number | null;
 
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

 export type gameHUD = "DEFAULT" | "ALLOCATION" | "ATTACK" | "MOVEMENT";

export interface CurrentTurnResponse {
  gameId: number;
  gameName: string;
  gameStatus: string;
  currentTurnPlayer: {
    playerGameId: number;
    username: string;
    color: string;
    turnOrder: number;
    unallocatedArmies: number;
    conqueredTerritoryThisTurn: boolean;
    imageUrl: string | null;
  };
  isMyTurn: boolean;
  totalPlayers: number;
  activePlayers: number;
}

export interface TroopMovementRequest {
    sourceTerritory:number;
    targetTerritory:number;
    numberOfTroops:number;
    gameId:number;
}

export interface AttackResult {
  attackerDice: number[];
  defenderDice: number[];
  attackerWins: number;
  defenderWins: number;
  conquered: boolean;
  attackerLosses?: number;
  defenderLosses?: number;
}