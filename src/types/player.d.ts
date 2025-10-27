interface PlayerGameDto {
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

interface PlayerDto {
  id: number;
  username: string;
  imageUrl: string;
}
