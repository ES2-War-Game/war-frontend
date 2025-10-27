

interface GameStateResponseDto{
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

interface ObjectiveDto{
    id: number;
    description: string;
    type: string; // pode ser especializado conforme backend (ex.: "ELIMINATE" | "DOMINATE")
}

interface GameTerritoryDto{
    id: number;
    territory: Territory; // nome do território (usar como chave para pintura)
    ownerId: number; // relaciona com PlayerGameDto.id
    staticArmies: number;
    movedInArmies: number;
    unallocatedArmies: number;
}

interface Territory{
    id:number;
    name:string;
    continent:string
}

interface TerritoryDto{
    id: number;
    name: string;
    continent: string;
}


