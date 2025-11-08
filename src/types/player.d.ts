export interface PlayerGameDto {
  id: number;
  turnOrder: number;
  color: string;
  isOwner: boolean;
  unallocatedArmies: number;
  conqueredTerritoryThisTurn: boolean;
  stillInGame: boolean;
  objective: ObjectiveDto;
  player: PlayerDto;
}

export interface PlayerDto {
  id: number;
  username: string;
  email?: string;
  imageUrl?: string | null;
}
