export interface Player {
  id: number;
  username: string;
  email: string;
  image:string
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

export interface LobbyDetails {
  id: number;
  name: string;
  status: string;
  players: Player[];
}