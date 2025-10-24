export interface Player {
  id: number;
  username: string;
  email: string;
}

export interface LobbyCreationRequestDto {
  lobbyName: string;
}

export interface LobbyCreationResponseDto {
  id: number;
  name: string;
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