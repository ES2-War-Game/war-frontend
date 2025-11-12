export interface ChatMessageDto {
  senderUsername: string;
  content: string;
  timestamp?: string;
  color?: string;
}

export interface ChatMessage extends ChatMessageDto {
  id: string;
  timestamp: string;
}

export interface ChatStorage {
  [gameId: string]: ChatMessage[];
}
