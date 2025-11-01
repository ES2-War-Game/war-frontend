export interface Player {
  id: number;
  username: string;
  color: string;
  isOwner?: boolean;  // Alias para owner
  owner?: boolean;    // Propriedade real do backend
  isReady?: boolean;
  imageUrl: string | null;
}

export type GameStatus = 
  | 'LOBBY' 
  | 'SETUP_ALLOCATION' 
  | 'REINFORCEMENT' 
  | 'ATTACK' 
  | 'MOVEMENT' 
  | 'FINISHED';

export interface PlayerGame {
  id: number;
  player: {
    id: number;
    username: string;
    imageUrl?: string | null;
  };
  turnOrder: number;
  color: string;
  isOwner?: boolean;
  owner?: boolean;
  stillInGame: boolean;
  unallocatedArmies: number;
  objective?: {
    id: number;
    description: string;
    type: string;
  };
  conqueredTerritoryThisTurn?: boolean;
}

export interface GameState {
  id: number;
  status: GameStatus;
  createdAt: string;
  name: string;
  currentTurnPlayerId?: number;
  turnPlayer?: PlayerGame;
  winner?: PlayerGame | null;
  cardSetExchangeCount: number;
  playerGames: PlayerGame[];
  players: PlayerGame[];
  gameTerritories?: unknown[];
  territories?: unknown[];
  maxPlayers?: number;
}

export interface LobbyCreationRequestDto {
  lobbyName: string;
}

export interface LobbyCreationResponseDto {
  gameId: number;
  lobbyName: string;
}

export interface LobbyListResponseDto {
  id: number;
  name: string;
  status: string;
}

export interface GameLobbyDetailsDto {
  id: number;
  name: string;
  status: string;
  players: Player[];
}

export interface LobbyDetails {
  id: number;
  name: string;
  status: string;
  players: Player[];
}